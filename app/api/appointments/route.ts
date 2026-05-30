import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { z } from 'zod'

const appointmentSchema = z.object({
  lawyer_id: z.string().uuid(),
  appointment_date: z.string().datetime(),
  duration_minutes: z.number().min(30).max(120),
  notes: z.string().optional(),
  legal_issue: z.string().min(10),
})

// POST /api/appointments - Create appointment
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const validated = appointmentSchema.parse(body)

    const supabase = createClient()

    // Get lawyer details
    const { data: lawyer, error: lawyerError } = await supabase
      .from('lawyers')
      .select('fee_per_hour, users:user_id(name, email)')
      .eq('id', validated.lawyer_id)
      .single()

    if (lawyerError || !lawyer) {
      return NextResponse.json({ error: 'Lawyer not found' }, { status: 404 })
    }

    // Calculate fee
    const fee = (lawyer.fee_per_hour * validated.duration_minutes) / 60

    // Check if time slot is available
    const { data: existing } = await supabase
      .from('appointments')
      .select('id')
      .eq('lawyer_id', validated.lawyer_id)
      .eq('appointment_date', validated.appointment_date)
      .in('status', ['pending', 'confirmed'])
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'Time slot is not available' },
        { status: 409 }
      )
    }

    // Create appointment
    const { data: appointment, error } = await supabase
      .from('appointments')
      .insert({
        client_id: session.user.id,
        lawyer_id: validated.lawyer_id,
        appointment_date: validated.appointment_date,
        duration_minutes: validated.duration_minutes,
        notes: validated.notes,
        fee,
        status: 'pending',
        payment_status: 'pending',
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Create notification for lawyer
    await supabaseAdmin
      .from('notifications')
      .insert({
        user_id: lawyer.user_id,
        title: 'New Appointment Request',
        message: `New appointment request from ${session.user.name}`,
        type: 'appointment',
        metadata: { appointment_id: appointment.id },
      })

    return NextResponse.json({ appointment }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Create Appointment Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET /api/appointments - Get user appointments
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const limit = parseInt(searchParams.get('limit') || '50')

    const supabase = createClient()

    // Get user role
    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single()

    let query = supabase
      .from('appointments')
      .select(`
        *,
        client:client_id (
          id,
          name,
          email,
          avatar_url
        ),
        lawyer:lawyer_id (
          id,
          fee_per_hour,
          users:user_id (
            name,
            email,
            avatar_url
          )
        )
      `)

    // Filter by user role
    if (user?.role === 'client') {
      query = query.eq('client_id', session.user.id)
    } else if (user?.role === 'lawyer') {
      const { data: lawyer } = await supabase
        .from('lawyers')
        .select('id')
        .eq('user_id', session.user.id)
        .single()
      
      if (lawyer) {
        query = query.eq('lawyer_id', lawyer.id)
      }
    }

    // Apply filters
    if (status) {
      query = query.eq('status', status)
    }
    if (startDate) {
      query = query.gte('appointment_date', startDate)
    }
    if (endDate) {
      query = query.lte('appointment_date', endDate)
    }

    const { data, error } = await query
      .order('appointment_date', { ascending: true })
      .limit(limit)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ appointments: data })
  } catch (error) {
    console.error('Get Appointments Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/appointments/:id - Update appointment
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { status, meeting_link, lawyer_notes, cancellation_reason } = body

    const supabase = createClient()

    // Get appointment details
    const { data: appointment, error: getError } = await supabase
      .from('appointments')
      .select('*, client:client_id(id, name), lawyer:lawyer_id(id, user_id)')
      .eq('id', params.id)
      .single()

    if (getError || !appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
    }

    // Check permissions
    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single()

    const isClient = appointment.client_id === session.user.id
    const isLawyer = appointment.lawyer.user_id === session.user.id
    const isAdmin = user?.role === 'admin'

    if (!isClient && !isLawyer && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Update appointment
    const updateData: any = {}
    if (status) updateData.status = status
    if (meeting_link && isLawyer) updateData.meeting_link = meeting_link
    if (lawyer_notes && isLawyer) updateData.lawyer_notes = lawyer_notes
    if (cancellation_reason && status === 'cancelled') updateData.cancellation_reason = cancellation_reason

    const { data: updated, error: updateError } = await supabase
      .from('appointments')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // Create notification for status change
    if (status) {
      const notifyUserId = isClient ? appointment.lawyer.user_id : appointment.client_id
      await supabaseAdmin
        .from('notifications')
        .insert({
          user_id: notifyUserId,
          title: `Appointment ${status}`,
          message: `Your appointment has been ${status}`,
          type: 'appointment',
          metadata: { appointment_id: appointment.id },
        })
    }

    return NextResponse.json({ appointment: updated })
  } catch (error) {
    console.error('Update Appointment Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/appointments/:id - Cancel appointment
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createClient()

    // Get appointment
    const { data: appointment, error: getError } = await supabase
      .from('appointments')
      .select('*, client:client_id(id), lawyer:lawyer_id(user_id)')
      .eq('id', params.id)
      .single()

    if (getError || !appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
    }

    // Check permissions
    const isClient = appointment.client_id === session.user.id
    const isLawyer = appointment.lawyer.user_id === session.user.id

    if (!isClient && !isLawyer) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Update status to cancelled
    const { error } = await supabase
      .from('appointments')
      .update({ 
        status: 'cancelled',
        cancellation_reason: 'Cancelled by user'
      })
      .eq('id', params.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Cancel Appointment Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}