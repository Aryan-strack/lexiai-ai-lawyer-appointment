export const APPOINTMENT_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  RESCHEDULED: 'rescheduled',
} as const

export type AppointmentStatus = typeof APPOINTMENT_STATUS[keyof typeof APPOINTMENT_STATUS]

export const APPOINTMENT_STATUS_LABELS: Record<AppointmentStatus, string> = {
  [APPOINTMENT_STATUS.PENDING]: 'Pending',
  [APPOINTMENT_STATUS.CONFIRMED]: 'Confirmed',
  [APPOINTMENT_STATUS.COMPLETED]: 'Completed',
  [APPOINTMENT_STATUS.CANCELLED]: 'Cancelled',
  [APPOINTMENT_STATUS.RESCHEDULED]: 'Rescheduled',
}

export const APPOINTMENT_STATUS_COLORS: Record<AppointmentStatus, string> = {
  [APPOINTMENT_STATUS.PENDING]: 'warning',
  [APPOINTMENT_STATUS.CONFIRMED]: 'success',
  [APPOINTMENT_STATUS.COMPLETED]: 'default',
  [APPOINTMENT_STATUS.CANCELLED]: 'destructive',
  [APPOINTMENT_STATUS.RESCHEDULED]: 'secondary',
}

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded',
} as const

export type PaymentStatus = typeof PAYMENT_STATUS[keyof typeof PAYMENT_STATUS]

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  [PAYMENT_STATUS.PENDING]: 'Pending',
  [PAYMENT_STATUS.PROCESSING]: 'Processing',
  [PAYMENT_STATUS.COMPLETED]: 'Completed',
  [PAYMENT_STATUS.FAILED]: 'Failed',
  [PAYMENT_STATUS.REFUNDED]: 'Refunded',
}

export const PAYMENT_STATUS_COLORS: Record<PaymentStatus, string> = {
  [PAYMENT_STATUS.PENDING]: 'warning',
  [PAYMENT_STATUS.PROCESSING]: 'info',
  [PAYMENT_STATUS.COMPLETED]: 'success',
  [PAYMENT_STATUS.FAILED]: 'destructive',
  [PAYMENT_STATUS.REFUNDED]: 'secondary',
}

export const SUBSCRIPTION_STATUS = {
  ACTIVE: 'active',
  CANCELED: 'canceled',
  PAST_DUE: 'past_due',
  TRIALING: 'trialing',
  INCOMPLETE: 'incomplete',
} as const

export type SubscriptionStatus = typeof SUBSCRIPTION_STATUS[keyof typeof SUBSCRIPTION_STATUS]

export const SUBSCRIPTION_STATUS_LABELS: Record<SubscriptionStatus, string> = {
  [SUBSCRIPTION_STATUS.ACTIVE]: 'Active',
  [SUBSCRIPTION_STATUS.CANCELED]: 'Canceled',
  [SUBSCRIPTION_STATUS.PAST_DUE]: 'Past Due',
  [SUBSCRIPTION_STATUS.TRIALING]: 'Trialing',
  [SUBSCRIPTION_STATUS.INCOMPLETE]: 'Incomplete',
}

export const VERIFICATION_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const

export type VerificationStatus = typeof VERIFICATION_STATUS[keyof typeof VERIFICATION_STATUS]

export const VERIFICATION_STATUS_LABELS: Record<VerificationStatus, string> = {
  [VERIFICATION_STATUS.PENDING]: 'Pending Review',
  [VERIFICATION_STATUS.APPROVED]: 'Verified',
  [VERIFICATION_STATUS.REJECTED]: 'Rejected',
}

export const NOTIFICATION_TYPE = {
  APPOINTMENT: 'appointment',
  PAYMENT: 'payment',
  SYSTEM: 'system',
  AI_UPDATE: 'ai_update',
} as const

export type NotificationType = typeof NOTIFICATION_TYPE[keyof typeof NOTIFICATION_TYPE]

export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  [NOTIFICATION_TYPE.APPOINTMENT]: 'Appointment',
  [NOTIFICATION_TYPE.PAYMENT]: 'Payment',
  [NOTIFICATION_TYPE.SYSTEM]: 'System',
  [NOTIFICATION_TYPE.AI_UPDATE]: 'AI Update',
}

export const NOTIFICATION_TYPE_ICONS: Record<NotificationType, string> = {
  [NOTIFICATION_TYPE.APPOINTMENT]: 'Calendar',
  [NOTIFICATION_TYPE.PAYMENT]: 'CreditCard',
  [NOTIFICATION_TYPE.SYSTEM]: 'Settings',
  [NOTIFICATION_TYPE.AI_UPDATE]: 'Bot',
}

export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
} as const

export type UserStatus = typeof USER_STATUS[keyof typeof USER_STATUS]

export const DOCUMENT_TYPE = {
  LEGAL_DOCUMENT: 'legal_document',
  ID_PROOF: 'id_proof',
  CASE_FILE: 'case_file',
  OTHER: 'other',
} as const

export type DocumentType = typeof DOCUMENT_TYPE[keyof typeof DOCUMENT_TYPE]

export const DAYS_OF_WEEK = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
]

export const APPOINTMENT_DURATIONS = [
  { value: 30, label: '30 minutes' },
  { value: 60, label: '1 hour' },
  { value: 90, label: '1.5 hours' },
  { value: 120, label: '2 hours' },
]

export const TIME_SLOTS = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
  '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM',
  '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM',
  '05:00 PM',
]