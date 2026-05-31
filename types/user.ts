export type UserRole = 'admin' | 'lawyer' | 'client'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  phone?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface UserProfile extends User {
  subscription?: Subscription
  stats?: UserStats
}

export interface Subscription {
  id: string
  user_id: string
  plan_type: 'free' | 'basic' | 'pro' | 'enterprise'
  stripe_subscription_id?: string
  stripe_customer_id?: string
  ai_calls_limit: number
  ai_calls_used: number
  status: 'active' | 'canceled' | 'past_due' | 'trialing'
  current_period_start: string
  current_period_end: string
  created_at: string
  updated_at: string
}

export interface UserStats {
  totalAppointments: number
  totalSpent: number
  averageRating: number
  documentsCount: number
}

export interface AuthResponse {
  user: User
  session: {
    access_token: string
    refresh_token: string
    expires_at: number
  }
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  name: string
  role?: UserRole
  phone?: string
}

export interface UpdateProfileData {
  name?: string
  phone?: string
  avatar_url?: string
}

export interface PasswordResetData {
  email: string
  password?: string
  token?: string
}