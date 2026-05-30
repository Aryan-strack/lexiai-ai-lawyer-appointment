import { z } from 'zod'

export const appointmentSchema = z.object({
  lawyerId: z.string().uuid('Invalid lawyer ID'),
  appointmentDate: z.date({
    required_error: 'Appointment date is required',
    invalid_type_error: 'Invalid date',
  }),
  duration: z.enum(['30', '60', '90', '120']).transform(Number),
  notes: z
    .string()
    .max(500, 'Notes must be less than 500 characters')
    .optional(),
  legalIssue: z
    .string()
    .min(10, 'Please describe your legal issue in at least 10 characters')
    .max(1000, 'Description too long'),
})

export type AppointmentInput = z.infer<typeof appointmentSchema>

// Date validation helper
export function validateAppointmentDate(date: Date): boolean {
  const now = new Date()
  const minDate = new Date(now.setHours(now.getHours() + 24)) // At least 24 hours in advance
  const maxDate = new Date(now.setMonth(now.getMonth() + 3)) // Max 3 months ahead
  
  return date >= minDate && date <= maxDate
}

// Availability check schema
export const availabilitySchema = z.object({
  lawyerId: z.string().uuid(),
  date: z.date(),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
})

export type AvailabilityCheck = z.infer<typeof availabilitySchema>

// Reschedule schema
export const rescheduleSchema = z.object({
  appointmentId: z.string().uuid(),
  newDate: z.date(),
  reason: z.string().min(10, 'Please provide a reason for rescheduling'),
})

export type RescheduleInput = z.infer<typeof rescheduleSchema>

// Validation helpers
export function validateAppointment(data: unknown) {
  const result = appointmentSchema.safeParse(data)
  if (!result.success) {
    const errors = result.error.flatten().fieldErrors
    return { success: false, errors }
  }
  
  // Additional custom validation
  if (!validateAppointmentDate(result.data.appointmentDate)) {
    return {
      success: false,
      errors: {
        appointmentDate: ['Appointment must be at least 24 hours in advance and within 3 months'],
      },
    }
  }
  
  return { success: true, data: result.data }
}