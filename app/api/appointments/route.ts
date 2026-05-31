import { NextRequest, NextResponse } from 'next/server'
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

// POST /api/appointments — Create appointment
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const validated = appointmentSchema.parse(body)

    // Get lawyer details (include user_id for notification)
    const { data: lawyer, error: lawyerError } = await supabase
      .from('lawyers')
      .select('id, fee_per_hour, user_id, users:user_id(name, email)') // ✅ user_id included
      .eq('id', validated.lawyer_id)
      .single()

    if (lawyerError || !lawyer) {
      return NextResponse.json({ error: 'Lawyer not found' }, { status: 404 })
    }

    // Calculate fee
    const fee = (lawyer.fee_per_hour * validated.duration_minutes) / 60

    // Check if time slot is already taken
    const { data: existing } = await supabase
      .from('appointments')
      .select('id')
      .eq('lawyer_id', validated.lawyer_id)
      .eq('appointment_date', validated.appointment_date)
      .in('status', ['pending', 'confirmed'])
      .maybeSingle()

    if (existing) {
      return NextResponse.json(
        { error: 'This time slot is not available. Please choose another time.' },
        { status: 409 }
      )
    }

    // Create appointment
    const { data: appointment, error } = await supabase
      .from('appointments')
      .insert({
        client_id: user.id,
        lawyer_id: validated.lawyer_id,
        appointment_date: validated.appointment_date,
        duration_minutes: validated.duration_minutes,
        notes: validated.notes ?? null,
        fee,
        status: 'pending',
        payment_status: 'pending',
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Get client name for notification
    const { data: clientProfile } = await supabase
      .from('users')
      .select('name')
      .eq('id', user.id)
      .single()

    // Create notification for lawyer using admin client
    await supabaseAdmin
      .from('notifications')
      .insert({
        user_id: lawyer.user_id, // ✅ Fixed: user_id now correctly selected
        title: 'New Appointment Request',
        message: `New appointment request from ${clientProfile?.name ?? 'a client'}`,
        type: 'appointment',
        metadata: { appointment_id: appointment.id },
      })

    return NextResponse.json({ appointment }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Create Appointment Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET /api/appointments — Get user appointments
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)

    // Get user role
    const { data: userProfile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    let query = supabase
      .from('appointments')
      .select(`
        *,
        client:client_id (id, name, email, avatar_url),
        lawyer:lawyer_id (
          id,
          fee_per_hour,
          users:user_id (name, email, avatar_url)
        )
      `)

    // Filter by role
    if (userProfile?.role === 'client') {
      query = query.eq('client_id', user.id)
    } else if (userProfile?.role === 'lawyer') {
      const { data: lawyerProfile } = await supabase
        .from('lawyers')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (lawyerProfile) {
        query = query.eq('lawyer_id', lawyerProfile.id)
      }
    }
    // admin sees all

    if (status) query = query.eq('status', status)
    if (startDate) query = query.gte('appointment_date', startDate)
    if (endDate) query = query.lte('appointment_date', endDate)

    const { data, error } = await query
      .order('appointment_date', { ascending: true })
      .limit(limit)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ appointments: data ?? [] })
  } catch (error) {
    console.error('Get Appointments Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}