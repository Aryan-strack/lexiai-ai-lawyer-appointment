export const PUBLIC_ROUTES = {
  HOME: '/',
  ABOUT: '/about',
  CONTACT: '/contact',
  PRICING: '/pricing',
  FAQ: '/faq',
  LAWYERS: '/lawyers',
  LAWYER_DETAILS: (id: string) => `/lawyers/${id}`,
  AI_ASSISTANT: '/ai-assistant',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
} as const

export const PROTECTED_ROUTES = {
  DASHBOARD: '/dashboard',
  
  // Admin Routes
  ADMIN_DASHBOARD: '/dashboard/admin',
  ADMIN_USERS: '/dashboard/admin/users',
  ADMIN_LAWYERS: '/dashboard/admin/lawyers',
  ADMIN_ANALYTICS: '/dashboard/admin/analytics',
  ADMIN_SUBSCRIPTIONS: '/dashboard/admin/subscriptions',
  ADMIN_SETTINGS: '/dashboard/admin/settings',
  
  // Lawyer Routes
  LAWYER_DASHBOARD: '/dashboard/lawyer',
  LAWYER_APPOINTMENTS: '/dashboard/lawyer/appointments',
  LAWYER_CLIENTS: '/dashboard/lawyer/clients',
  LAWYER_EARNINGS: '/dashboard/lawyer/earnings',
  LAWYER_REVIEWS: '/dashboard/lawyer/reviews',
  LAWYER_PROFILE: '/dashboard/lawyer/profile',
  LAWYER_AVAILABILITY: '/dashboard/lawyer/availability',
  
  // Client Routes
  CLIENT_DASHBOARD: '/dashboard/client',
  CLIENT_APPOINTMENTS: '/dashboard/client/appointments',
  CLIENT_DOCUMENTS: '/dashboard/client/documents',
  CLIENT_PAYMENTS: '/dashboard/client/payments',
  CLIENT_NOTIFICATIONS: '/dashboard/client/notifications',
  CLIENT_PROFILE: '/dashboard/client/profile',
  CLIENT_FAVORITES: '/dashboard/client/favorites',
  
  // Common Routes
  CHAT: '/chat',
  VIDEO_CONSULTATION: '/video-consultation',
  APPOINTMENTS: '/appointments',
} as const

export const API_ROUTES = {
  AUTH: '/api/auth',
  AI: '/api/ai',
  LAWYERS: '/api/lawyers',
  APPOINTMENTS: '/api/appointments',
  PAYMENTS: '/api/payments',
  REVIEWS: '/api/reviews',
  NOTIFICATIONS: '/api/notifications',
  DOCUMENTS: '/api/documents',
  ANALYTICS: '/api/analytics',
} as const

export const ROUTE_ACCESS = {
  [PROTECTED_ROUTES.ADMIN_DASHBOARD]: ['admin'],
  [PROTECTED_ROUTES.ADMIN_USERS]: ['admin'],
  [PROTECTED_ROUTES.ADMIN_LAWYERS]: ['admin'],
  [PROTECTED_ROUTES.ADMIN_ANALYTICS]: ['admin'],
  [PROTECTED_ROUTES.ADMIN_SUBSCRIPTIONS]: ['admin'],
  [PROTECTED_ROUTES.ADMIN_SETTINGS]: ['admin'],
  
  [PROTECTED_ROUTES.LAWYER_DASHBOARD]: ['admin', 'lawyer'],
  [PROTECTED_ROUTES.LAWYER_APPOINTMENTS]: ['admin', 'lawyer'],
  [PROTECTED_ROUTES.LAWYER_CLIENTS]: ['admin', 'lawyer'],
  [PROTECTED_ROUTES.LAWYER_EARNINGS]: ['admin', 'lawyer'],
  [PROTECTED_ROUTES.LAWYER_REVIEWS]: ['admin', 'lawyer'],
  [PROTECTED_ROUTES.LAWYER_PROFILE]: ['admin', 'lawyer'],
  [PROTECTED_ROUTES.LAWYER_AVAILABILITY]: ['admin', 'lawyer'],
  
  [PROTECTED_ROUTES.CLIENT_DASHBOARD]: ['admin', 'client'],
  [PROTECTED_ROUTES.CLIENT_APPOINTMENTS]: ['admin', 'client'],
  [PROTECTED_ROUTES.CLIENT_DOCUMENTS]: ['admin', 'client'],
  [PROTECTED_ROUTES.CLIENT_PAYMENTS]: ['admin', 'client'],
  [PROTECTED_ROUTES.CLIENT_NOTIFICATIONS]: ['admin', 'client'],
  [PROTECTED_ROUTES.CLIENT_PROFILE]: ['admin', 'client'],
  [PROTECTED_ROUTES.CLIENT_FAVORITES]: ['admin', 'client'],
} as const

export const NAVIGATION_ITEMS = {
  public: [
    { name: 'Home', href: PUBLIC_ROUTES.HOME },
    { name: 'Find Lawyers', href: PUBLIC_ROUTES.LAWYERS },
    { name: 'AI Assistant', href: PUBLIC_ROUTES.AI_ASSISTANT },
    { name: 'Pricing', href: PUBLIC_ROUTES.PRICING },
    { name: 'About', href: PUBLIC_ROUTES.ABOUT },
    { name: 'Contact', href: PUBLIC_ROUTES.CONTACT },
  ],
  admin: [
    { name: 'Dashboard', href: PROTECTED_ROUTES.ADMIN_DASHBOARD, icon: 'LayoutDashboard' },
    { name: 'Users', href: PROTECTED_ROUTES.ADMIN_USERS, icon: 'Users' },
    { name: 'Lawyers', href: PROTECTED_ROUTES.ADMIN_LAWYERS, icon: 'Scale' },
    { name: 'Analytics', href: PROTECTED_ROUTES.ADMIN_ANALYTICS, icon: 'BarChart3' },
    { name: 'Subscriptions', href: PROTECTED_ROUTES.ADMIN_SUBSCRIPTIONS, icon: 'CreditCard' },
    { name: 'Settings', href: PROTECTED_ROUTES.ADMIN_SETTINGS, icon: 'Settings' },
  ],
  lawyer: [
    { name: 'Dashboard', href: PROTECTED_ROUTES.LAWYER_DASHBOARD, icon: 'LayoutDashboard' },
    { name: 'Appointments', href: PROTECTED_ROUTES.LAWYER_APPOINTMENTS, icon: 'Calendar' },
    { name: 'Clients', href: PROTECTED_ROUTES.LAWYER_CLIENTS, icon: 'Users' },
    { name: 'Earnings', href: PROTECTED_ROUTES.LAWYER_EARNINGS, icon: 'DollarSign' },
    { name: 'Reviews', href: PROTECTED_ROUTES.LAWYER_REVIEWS, icon: 'Star' },
    { name: 'Profile', href: PROTECTED_ROUTES.LAWYER_PROFILE, icon: 'User' },
  ],
  client: [
    { name: 'Dashboard', href: PROTECTED_ROUTES.CLIENT_DASHBOARD, icon: 'LayoutDashboard' },
    { name: 'Appointments', href: PROTECTED_ROUTES.CLIENT_APPOINTMENTS, icon: 'Calendar' },
    { name: 'Documents', href: PROTECTED_ROUTES.CLIENT_DOCUMENTS, icon: 'FileText' },
    { name: 'Payments', href: PROTECTED_ROUTES.CLIENT_PAYMENTS, icon: 'CreditCard' },
    { name: 'Notifications', href: PROTECTED_ROUTES.CLIENT_NOTIFICATIONS, icon: 'Bell' },
    { name: 'Profile', href: PROTECTED_ROUTES.CLIENT_PROFILE, icon: 'User' },
  ],
}