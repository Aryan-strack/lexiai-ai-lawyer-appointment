export type UserRole = 'admin' | 'lawyer' | 'client'

// Role hierarchy (higher number = more permissions)
const roleHierarchy: Record<UserRole, number> = {
  admin: 3,
  lawyer: 2,
  client: 1,
}

// Permission matrix
const permissions = {
  admin: {
    canViewAllUsers: true,
    canEditUsers: true,
    canDeleteUsers: true,
    canVerifyLawyers: true,
    canViewAnalytics: true,
    canManageSubscriptions: true,
    canViewRevenue: true,
    canManageSystem: true,
  },
  lawyer: {
    canViewAllUsers: false,
    canEditUsers: false,
    canDeleteUsers: false,
    canVerifyLawyers: false,
    canViewAnalytics: false,
    canManageSubscriptions: false,
    canViewRevenue: true,
    canManageSystem: false,
    canManageOwnProfile: true,
    canManageAppointments: true,
    canViewClients: true,
  },
  client: {
    canViewAllUsers: false,
    canEditUsers: false,
    canDeleteUsers: false,
    canVerifyLawyers: false,
    canViewAnalytics: false,
    canManageSubscriptions: false,
    canViewRevenue: false,
    canManageSystem: false,
    canManageOwnProfile: true,
    canBookAppointments: true,
    canViewLawyers: true,
  },
}

// Check if user has role-based permission
export function hasPermission(role: UserRole, permission: keyof (typeof permissions)[UserRole]): boolean {
  return (permissions[role] as any)[permission] === true
}

// Check if user has required role or higher
export function hasMinRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole]
}

// Check if user can access resource
export function canAccessResource(
  userRole: UserRole,
  resourceOwnerId: string,
  currentUserId: string
): boolean {
  if (userRole === 'admin') return true
  if (userRole === 'lawyer') {
    // Lawyers can access their own resources and clients
    return resourceOwnerId === currentUserId
  }
  // Clients can only access their own resources
  return resourceOwnerId === currentUserId
}

export async function requireAuth(role?: UserRole) {
  const { createClient } = await import('@/lib/supabase/server')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Unauthorized: Please login')
  }

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  const userRole = profile?.role as UserRole
  
  if (role && !hasMinRole(userRole, role)) {
    throw new Error(`Forbidden: ${role} role required`)
  }

  return { user, userRole }
}

// Route protection mapping
export const protectedRoutes: Record<string, UserRole[]> = {
  '/dashboard/admin': ['admin'],
  '/dashboard/lawyer': ['admin', 'lawyer'],
  '/dashboard/client': ['admin', 'lawyer', 'client'],
  '/api/admin': ['admin'],
  '/api/lawyer': ['admin', 'lawyer'],
  '/api/client': ['admin', 'lawyer', 'client'],
}