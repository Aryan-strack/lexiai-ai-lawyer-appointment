'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authService, AuthUser } from '@/services/auth.service'

interface AuthState {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
  // Actions
  signIn: (email: string, password: string) => Promise<AuthUser>
  signInWithEmail: (email: string, password: string) => Promise<AuthUser> // alias for compatibility
  signUp: (email: string, password: string, name: string, role?: 'client' | 'lawyer') => Promise<AuthUser>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (data: Partial<AuthUser>) => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updatePassword: (password: string) => Promise<void>
  checkAuth: () => Promise<void>
}

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: true,
      isAuthenticated: false,

      signIn: async (email: string, password: string) => {
        set({ isLoading: true })
        try {
          const user = await authService.signIn(email, password)
          set({ user, isAuthenticated: true, isLoading: false })
          return user
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      // Alias so LoginForm works with both names
      signInWithEmail: async (email: string, password: string) => {
        set({ isLoading: true })
        try {
          const user = await authService.signIn(email, password)
          set({ user, isAuthenticated: true, isLoading: false })
          return user
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      signUp: async (email: string, password: string, name: string, role: 'client' | 'lawyer' = 'client') => {
        set({ isLoading: true })
        try {
          const user = await authService.signUp(email, password, name, role)
          set({ user, isAuthenticated: true, isLoading: false })
          return user
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      signInWithGoogle: async () => {
        set({ isLoading: true })
        try {
          await authService.signInWithGoogle()
          // User will be redirected by OAuth flow
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      signOut: async () => {
        set({ isLoading: true })
        try {
          await authService.signOut()
          set({ user: null, isAuthenticated: false, isLoading: false })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      updateProfile: async (data: Partial<AuthUser>) => {
        set({ isLoading: true })
        try {
          const updatedUser = await authService.updateProfile(data)
          set({ user: updatedUser, isLoading: false })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      resetPassword: async (email: string) => {
        set({ isLoading: true })
        try {
          await authService.resetPassword(email)
          set({ isLoading: false })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      updatePassword: async (password: string) => {
        set({ isLoading: true })
        try {
          await authService.updatePassword(password)
          set({ isLoading: false })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      checkAuth: async () => {
        set({ isLoading: true })
        try {
          const session = await authService.getSession()
          if (!session) {
            set({ user: null, isAuthenticated: false, isLoading: false })
            return
          }

          const user = await authService.getCurrentUser()
          set({
            user,
            isAuthenticated: !!user,
            isLoading: false,
          })
        } catch {
          set({ user: null, isAuthenticated: false, isLoading: false })
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
)

// Initialize auth check on mount (client side only)
if (typeof window !== 'undefined') {
  useAuthStore.getState().checkAuth()
}

// Export as a proper React hook
export const useAuth = useAuthStore