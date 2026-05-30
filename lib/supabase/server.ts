import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '@/types/supabase'

export function createClient() {
  const cookieStore = cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Handle error - The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

// Server-side function to get session
export async function getServerSession() {
  const supabase = createClient()
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error) throw error
  return session
}

// Server-side function to get current user
export async function getServerUser() {
  const supabase = createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) throw error
  return user
}

// Server-side function to check if user is authenticated
export async function isAuthenticated() {
  const session = await getServerSession()
  return !!session
}

// Server-side function to get user role
export async function getUserRole() {
  const user = await getServerUser()
  if (!user) return null

  const supabase = createClient()
  const { data: profile, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (error) throw error
  return profile?.role
}