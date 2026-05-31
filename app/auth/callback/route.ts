import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Fetch user profile to see their role and redirect accordingly
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single()
        
        let redirectTo = '/dashboard/client'
        if (profile?.role === 'admin') redirectTo = '/dashboard/admin'
        if (profile?.role === 'lawyer') redirectTo = '/dashboard/lawyer'
        
        return NextResponse.redirect(new URL(redirectTo, request.url))
      }
    }
  }

  // Fallback redirect if something went wrong
  return NextResponse.redirect(new URL('/login?error=auth-failed', request.url))
}
