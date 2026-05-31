export const USER_ROLES = {
  ADMIN: 'admin',
  LAWYER: 'lawyer',
  CLIENT: 'client',
} as const

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES]

export const ROLE_LABELS: Record<UserRole, string> = {
  [USER_ROLES.ADMIN]: 'Administrator',
  [USER_ROLES.LAWYER]: 'Lawyer',
  [USER_ROLES.CLIENT]: 'Client',
}

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  [USER_ROLES.ADMIN]: 'Full platform access and management',
  [USER_ROLES.LAWYER]: 'Manage appointments, clients, and earnings',
  [USER_ROLES.CLIENT]: 'Book appointments and get legal help',
}

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  [USER_ROLES.ADMIN]: 3,
  [USER_ROLES.LAWYER]: 2,
  [USER_ROLES.CLIENT]: 1,
}

export const DEFAULT_ROLE = USER_ROLES.CLIENT

export const ROLE_PERMISSIONS = {
  [USER_ROLES.ADMIN]: {
    canManageUsers: true,
    canManageLawyers: true,
    canViewAnalytics: true,
    canManageSubscriptions: true,
    canViewRevenue: true,
    canManageSystem: true,
  },
  [USER_ROLES.LAWYER]: {
    canManageAppointments: true,
    canViewClients: true,
    canViewEarnings: true,
    canManageProfile: true,
    canRespondToReviews: true,
  },
  [USER_ROLES.CLIENT]: {
    canBookAppointments: true,
    canViewLawyers: true,
    canUploadDocuments: true,
    canManageProfile: true,
    canWriteReviews: true,
  },
} as const

export const ALLOWED_ROLES_FOR_REGISTRATION: UserRole[] = [
  USER_ROLES.CLIENT,
  USER_ROLES.LAWYER,
]