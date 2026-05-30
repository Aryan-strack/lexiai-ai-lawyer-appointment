import { createClient } from '@/lib/supabase/client'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { User, Session } from '@supabase/supabase-js'

export interface AuthUser {
  id: string
  email: string
  name: string
  role: 'admin' | 'lawyer' | 'client'
  phone?: string
  avatar_url?: string
  created_at: string
}

class AuthService {
  private supabase = createClient()

  async signUp(email: string, password: string, name: string, role: 'client' | 'lawyer' = 'client'): Promise<AuthUser> {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role },
      },
    })

    if (error) throw error
    if (!data.user) throw new Error('Signup failed')

    // Create user profile
    const { data: profile, error: profileError } = await this.supabase
      .from('users')
      .insert({
        id: data.user.id,
        email,
        name,
        role,
      })
      .select()
      .single()

    if (profileError) throw profileError

    // Create free subscription
    await this.supabase.from('subscriptions').insert({
      user_id: data.user.id,
      plan_type: 'free',
      ai_calls_limit: 50,
      ai_calls_used: 0,
      status: 'active',
    })

    return profile
  }

  async signIn(email: string, password: string): Promise<AuthUser> {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error

    const { data: profile } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single()

    return profile as AuthUser
  }

  async signInWithGoogle(): Promise<void> {
    const { error } = await this.supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) throw error
  }

  async signOut(): Promise<void> {
    const { error } = await this.supabase.auth.signOut()
    if (error) throw error
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    const { data: { user } } = await this.supabase.auth.getUser()
    if (!user) return null

    const { data: profile } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    return profile as AuthUser
  }

  async getSession(): Promise<Session | null> {
    const { data: { session } } = await this.supabase.auth.getSession()
    return session
  }

  async resetPassword(email: string): Promise<void> {
    const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) throw error
  }

  async updatePassword(password: string): Promise<void> {
    const { error } = await this.supabase.auth.updateUser({ password })
    if (error) throw error
  }

  async updateProfile(data: Partial<AuthUser>): Promise<AuthUser> {
    const user = await this.getCurrentUser()
    if (!user) throw new Error('No user found')

    const { data: updated, error } = await this.supabase
      .from('users')
      .update({
        name: data.name,
        phone: data.phone,
        avatar_url: data.avatar_url,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select()
      .single()

    if (error) throw error
    return updated
  }

  async isAuthenticated(): Promise<boolean> {
    const session = await this.getSession()
    return !!session
  }

  async getUserRole(): Promise<string | null> {
    const user = await this.getCurrentUser()
    return user?.role || null
  }

  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return this.supabase.auth.onAuthStateChange(callback)
  }
}

export const authService = new AuthService()