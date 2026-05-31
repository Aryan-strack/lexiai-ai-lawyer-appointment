import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createClient } from '@/lib/supabase/client'

export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'lawyer' | 'client'
  phone?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

interface AuthState {
  user: User | null
  session: any | null
  isLoading: boolean
  isAuthenticated: boolean
  
  // Actions
  setUser: (user: User | null) => void
  setSession: (session: any | null) => void
  setLoading: (isLoading: boolean) => void
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name: string, role?: 'client' | 'lawyer') => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  updateUser: (data: Partial<User>) => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updatePassword: (password: string) => Promise<void>
  checkAuth: () => Promise<void>
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      isLoading: true,
      isAuthenticated: false,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setSession: (session) => set({ session }),
      setLoading: (isLoading) => set({ isLoading }),

      signIn: async (email: string, password: string) => {
        set({ isLoading: true })
        const supabase = createClient()
        
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          })
          
          if (error) throw error
          
          // Fetch user profile
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', data.user.id)
            .single()
          
          set({
            user: profile as User,
            session: data.session,
            isAuthenticated: true,
            isLoading: false,
          })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      signUp: async (email: string, password: string, name: string, role: 'client' | 'lawyer' = 'client') => {
        set({ isLoading: true })
        const supabase = createClient()
        
        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: { name, role },
            },
          })
          
          if (error) throw error
          if (!data.user) throw new Error('Signup failed')
          
          // Create user profile
          const { data: profile, error: profileError } = await supabase
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
          
          // Create free subscription for client
          if (role === 'client') {
            await supabase.from('subscriptions').insert({
              user_id: data.user.id,
              plan_type: 'free',
              ai_calls_limit: 50,
              ai_calls_used: 0,
              status: 'active',
            })
          }
          
          // Create lawyer profile if role is lawyer
          if (role === 'lawyer') {
            await supabase.from('lawyers').insert({
              user_id: data.user.id,
              verified: false,
            })
          }
          
          set({
            user: profile as User,
            session: data.session,
            isAuthenticated: true,
            isLoading: false,
          })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      signInWithGoogle: async () => {
        set({ isLoading: true })
        const supabase = createClient()
        
        try {
          const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
              redirectTo: `${window.location.origin}/auth/callback`,
            },
          })
          
          if (error) throw error
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      signOut: async () => {
        set({ isLoading: true })
        const supabase = createClient()
        
        try {
          const { error } = await supabase.auth.signOut()
          if (error) throw error
          
          set({
            user: null,
            session: null,
            isAuthenticated: false,
            isLoading: false,
          })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      updateUser: async (data: Partial<User>) => {
        const { user } = get()
        if (!user) throw new Error('No user logged in')
        
        set({ isLoading: true })
        const supabase = createClient()
        
        try {
          const { data: updated, error } = await supabase
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
          
          set({ user: updated, isLoading: false })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      resetPassword: async (email: string) => {
        set({ isLoading: true })
        const supabase = createClient()
        
        try {
          const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
          })
          
          if (error) throw error
          set({ isLoading: false })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      updatePassword: async (password: string) => {
        set({ isLoading: true })
        const supabase = createClient()
        
        try {
          const { error } = await supabase.auth.updateUser({ password })
          if (error) throw error
          set({ isLoading: false })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      checkAuth: async () => {
        set({ isLoading: true })
        const supabase = createClient()
        
        try {
          const { data: { session } } = await supabase.auth.getSession()
          
          if (session) {
            const { data: profile } = await supabase
              .from('users')
              .select('*')
              .eq('id', session.user.id)
              .single()
            
            set({
              user: profile as User,
              session,
              isAuthenticated: true,
              isLoading: false,
            })
          } else {
            set({
              user: null,
              session: null,
              isAuthenticated: false,
              isLoading: false,
            })
          }
        } catch (error) {
          set({
            user: null,
            session: null,
            isAuthenticated: false,
            isLoading: false,
          })
        }
      },

      clearAuth: () => {
        set({
          user: null,
          session: null,
          isAuthenticated: false,
          isLoading: false,
        })
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
)