import { User } from './user'
import { Lawyer } from './lawyer'

export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled'
export type PaymentStatus = 'pending' | 'paid' | 'refunded'
export type MeetingPlatform = 'zoom' | 'google_meet' | 'in_person' | 'phone'

export interface Appointment {
  id: string
  client_id: string
  client?: User
  lawyer_id: string
  lawyer?: Lawyer
  appointment_date: string
  duration_minutes: number
  status: AppointmentStatus
  meeting_link?: string
  meeting_platform?: MeetingPlatform
  notes?: string
  client_notes?: string
  lawyer_notes?: string
  cancellation_reason?: string
  reschedule_count: number
  fee: number
  payment_status: PaymentStatus
  payment_intent_id?: string
  created_at: string
  updated_at: string
}

export interface CreateAppointmentData {
  lawyer_id: string
  appointment_date: Date
  duration_minutes: number
  notes?: string
  legal_issue: string
}

export interface UpdateAppointmentData {
  status?: AppointmentStatus
  meeting_link?: string
  lawyer_notes?: string
  cancellation_reason?: string
}

export interface RescheduleData {
  appointment_id: string
  new_date: Date
  reason: string
}

export interface TimeSlot {
  start_time: string
  end_time: string
  is_available: boolean
}

export interface AppointmentReminder {
  id: string
  appointment_id: string
  reminder_type: 'email' | 'sms' | 'push'
  scheduled_for: string
  sent_at?: string
  status: 'pending' | 'sent' | 'failed'
}

export interface AppointmentStats {
  total: number
  confirmed: number
  pending: number
  completed: number
  cancelled: number
  rescheduled: number
}

export interface AppointmentCalendarView {
  date: string
  slots: TimeSlot[]
  appointments: Appointment[]
}

export interface AppointmentFilterParams {
  status?: AppointmentStatus
  startDate?: Date
  endDate?: Date
  lawyerId?: string
  clientId?: string
  page?: number
  limit?: number
}