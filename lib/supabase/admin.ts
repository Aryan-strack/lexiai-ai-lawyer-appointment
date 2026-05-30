import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

// Admin client with service role (bypasses RLS)
// Use this ONLY in server-side API routes
const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

export { supabaseAdmin }

// Admin functions for user management
export async function getAllUsers() {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function updateUserRole(userId: string, role: 'admin' | 'lawyer' | 'client') {
  const { data, error } = await supabaseAdmin
    .from('users')
    .update({ role })
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteUser(userId: string) {
  // First delete user from auth
  const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId)
  if (authError) throw authError

  // User will be automatically deleted from users table via CASCADE
  return { success: true }
}

export async function getSystemStats() {
  const [users, lawyers, appointments, revenue] = await Promise.all([
    supabaseAdmin.from('users').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('lawyers').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('appointments').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('appointments').select('fee').eq('payment_status', 'paid'),
  ])

  const totalRevenue = revenue.data?.reduce((sum, apt) => sum + (apt.fee || 0), 0) || 0

  return {
    totalUsers: users.count || 0,
    totalLawyers: lawyers.count || 0,
    totalAppointments: appointments.count || 0,
    totalRevenue,
  }
}

export async function getAnalyticsData(startDate: Date, endDate: Date) {
  const { data, error } = await supabaseAdmin
    .from('analytics_events')
    .select('*')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())

  if (error) throw error
  return data
}