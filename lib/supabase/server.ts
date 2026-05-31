import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '@/types/supabase'

export async function createClient() {
  const cookieStore = await cookies() // ✅ Next.js 15: cookies() is async

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
            // This is called from a Server Component — safe to ignore
            // Middleware handles session refresh
          }
        },
      },
    }
  )
}

// Server-side function to get current authenticated user (more secure than getSession)
export async function getServerUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null
  return user
}

// Server-side function to check if user is authenticated
export async function isAuthenticated() {
  const user = await getServerUser()
  return !!user
}

// Server-side function to get user role from database
export async function getUserRole() {
  const user = await getServerUser()
  if (!user) return null

  const supabase = await createClient()
  const { data: profile, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (error) return null
  return profile?.role ?? null
}