import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

// PUT /api/appointments/[id] — Update appointment status/details
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    const { status, meeting_link, lawyer_notes, cancellation_reason, meeting_platform } = body

    // Get appointment details
    const { data: appointment, error: getError } = await supabase
      .from('appointments')
      .select('*, client:client_id(id, name), lawyer:lawyer_id(id, user_id)')
      .eq('id', id)
      .single()

    if (getError || !appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
    }

    // Check permissions
    const { data: userProfile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    const isClient = appointment.client_id === user.id
    const isLawyer = appointment.lawyer.user_id === user.id
    const isAdmin = userProfile?.role === 'admin'

    if (!isClient && !isLawyer && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Prepare update data
    const updateData: any = {}
    if (status) updateData.status = status
    if (meeting_link && isLawyer) updateData.meeting_link = meeting_link
    if (meeting_platform && isLawyer) updateData.meeting_platform = meeting_platform
    if (lawyer_notes && isLawyer) updateData.lawyer_notes = lawyer_notes
    if (cancellation_reason && status === 'cancelled') updateData.cancellation_reason = cancellation_reason

    const { data: updated, error: updateError } = await supabase
      .from('appointments')
      .update(updateData)
      .eq('id', id)
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
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/appointments/[id] — Cancel appointment
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Get appointment
    const { data: appointment, error: getError } = await supabase
      .from('appointments')
      .select('*, client:client_id(id), lawyer:lawyer_id(user_id)')
      .eq('id', id)
      .single()

    if (getError || !appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
    }

    // Check permissions
    const isClient = appointment.client_id === user.id
    const isLawyer = appointment.lawyer.user_id === user.id
    const isAdmin = false // TODO: Check if admin from user profile

    if (!isClient && !isLawyer && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Update status to cancelled instead of hard delete
    const { error } = await supabase
      .from('appointments')
      .update({
        status: 'cancelled',
        cancellation_reason: 'Cancelled by user',
      })
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Cancel Appointment Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
