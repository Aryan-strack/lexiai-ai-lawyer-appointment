import { createClient } from '@/lib/supabase/client'

export interface Appointment {
  id: string
  client_id: string
  lawyer_id: string
  appointment_date: string
  duration_minutes: number
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled'
  meeting_link?: string
  meeting_platform?: string
  notes?: string
  client_notes?: string
  lawyer_notes?: string
  fee: number
  payment_status: 'pending' | 'paid' | 'refunded'
  payment_intent_id?: string
  created_at: string
  updated_at: string
  client?: {
    id: string
    name: string
    email: string
    avatar_url?: string
  }
  lawyer?: {
    id: string
    name: string
    email: string
    avatar_url?: string
    fee_per_hour: number
  }
}

export interface CreateAppointmentData {
  lawyer_id: string
  appointment_date: Date
  duration_minutes: number
  notes?: string
  legal_issue: string
}

class AppointmentService {
  private supabase = createClient()

  async createAppointment(data: CreateAppointmentData): Promise<Appointment> {
    const response = await fetch('/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to create appointment')
    }

    const result = await response.json()
    return result.appointment
  }

  async getMyAppointments(
    role: 'client' | 'lawyer',
    status?: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<Appointment[]> {
    const url = new URL('/api/appointments', window.location.origin)
    if (status) url.searchParams.set('status', status)
    if (startDate) url.searchParams.set('startDate', startDate.toISOString())
    if (endDate) url.searchParams.set('endDate', endDate.toISOString())

    const response = await fetch(url.toString())
    if (!response.ok) throw new Error('Failed to fetch appointments')

    const data = await response.json()
    return data.appointments
  }

  async getAppointmentById(id: string): Promise<Appointment | null> {
    const { data, error } = await this.supabase
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
      .eq('id', id)
      .single()

    if (error) throw error
    if (!data) return null

    return {
      ...data,
      lawyer: {
        ...data.lawyer,
        name: data.lawyer?.users?.name,
        email: data.lawyer?.users?.email,
        avatar_url: data.lawyer?.users?.avatar_url,
      },
    } as Appointment
  }

  async updateAppointmentStatus(
    id: string,
    status: Appointment['status'],
    cancellationReason?: string
  ): Promise<Appointment> {
    const response = await fetch(`/api/appointments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, cancellation_reason: cancellationReason }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to update appointment')
    }

    const data = await response.json()
    return data.appointment
  }

  async addMeetingLink(id: string, meetingLink: string, platform: string = 'zoom'): Promise<Appointment> {
    const response = await fetch(`/api/appointments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ meeting_link: meetingLink, meeting_platform: platform }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to add meeting link')
    }

    const data = await response.json()
    return data.appointment
  }

  async addLawyerNotes(id: string, notes: string): Promise<Appointment> {
    const response = await fetch(`/api/appointments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lawyer_notes: notes }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to add notes')
    }

    const data = await response.json()
    return data.appointment
  }

  async cancelAppointment(id: string, reason?: string): Promise<void> {
    const response = await fetch(`/api/appointments/${id}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to cancel appointment')
    }
  }

  async getAvailableTimeSlots(lawyerId: string, date: Date): Promise<string[]> {
    const { data, error } = await this.supabase
      .rpc('get_available_time_slots', {
        p_lawyer_id: lawyerId,
        p_date: date.toISOString().split('T')[0],
      })

    if (error) throw error
    return data || []
  }

  async getUpcomingAppointments(): Promise<Appointment[]> {
    const { data, error } = await this.supabase
      .from('appointments')
      .select(`
        *,
        client:client_id (id, name, email, avatar_url),
        lawyer:lawyer_id (
          id,
          users:user_id (name, email, avatar_url)
        )
      `)
      .in('status', ['confirmed', 'pending'])
      .gte('appointment_date', new Date().toISOString())
      .order('appointment_date', { ascending: true })
      .limit(10)

    if (error) throw error

    return data.map(apt => ({
      ...apt,
      lawyer: {
        ...apt.lawyer,
        name: apt.lawyer?.users?.name,
        email: apt.lawyer?.users?.email,
        avatar_url: apt.lawyer?.users?.avatar_url,
      },
    })) as Appointment[]
  }

  async getAppointmentStats(): Promise<{
    total: number
    confirmed: number
    pending: number
    completed: number
    cancelled: number
  }> {
    const { data, error } = await this.supabase
      .from('appointments')
      .select('status')

    if (error) throw error

    const stats = {
      total: data.length,
      confirmed: data.filter(a => a.status === 'confirmed').length,
      pending: data.filter(a => a.status === 'pending').length,
      completed: data.filter(a => a.status === 'completed').length,
      cancelled: data.filter(a => a.status === 'cancelled').length,
    }

    return stats
  }
}

export const appointmentService = new AppointmentService()