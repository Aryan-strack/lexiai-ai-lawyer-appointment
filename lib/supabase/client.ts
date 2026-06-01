import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/supabase'

let supabaseClient: ReturnType<typeof createBrowserClient<Database>> | null = null

export function createClient() {
  if (supabaseClient) return supabaseClient

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  
  // Use dummy url/key to prevent crashes in UI if not configured
  const validUrl = url.startsWith('http') ? url : 'https://dummy.supabase.co'
  const validKey = key || 'dummy_key'

  supabaseClient = createBrowserClient<Database>(validUrl, validKey, {
    auth: {
      persistSession: true,
      detectSessionInUrl: true,
    },
  })

  return supabaseClient
}

// Helper function to get user session
export async function getSession() {
  const supabase = createClient()
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error) throw error
  return session
}

// Helper function to get current user
export async function getCurrentUser() {
  const supabase = createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) throw error
  return user
}

// Helper function to get user profile with role
export async function getUserProfile() {
  const supabase = createClient()
  const user = await getCurrentUser()
  
  if (!user) return null

  const { data: profile, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) throw error
  return profile
}