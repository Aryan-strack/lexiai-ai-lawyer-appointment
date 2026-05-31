import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseUrl.startsWith('http')) {
  throw new Error(
    'Invalid Supabase URL. Set NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL to a valid HTTP(S) Supabase project URL.'
  )
}

if (!supabaseAnonKey) {
  throw new Error(
    'Missing Supabase anon key. Set NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment.'
  )
}

const protectedRoutes = {
  admin: ['/dashboard/admin', '/api/admin'],
  lawyer: ['/dashboard/lawyer', '/api/lawyer'],
  client: ['/dashboard/client', '/chat', '/appointments', '/video-consultation'],
  auth: ['/login', '/register', '/forgot-password', '/reset-password'],
}

const publicRoutes = ['/', '/about', '/contact', '/pricing', '/faq', '/lawyers', '/ai-assistant']

export async function proxy(req: NextRequest) {
  let res = NextResponse.next({
    request: { headers: req.headers },
  })

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value))
          res = NextResponse.next({ request: req })
          cookiesToSet.forEach(({ name, value, options }) =>
            res.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const path = req.nextUrl.pathname
  const isAuthenticated = !!user

  let userRole: string | null = null
  if (isAuthenticated && user) {
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()
    userRole = userData?.role || null
  }

  if (isAuthenticated && protectedRoutes.auth.some(route => path.startsWith(route))) {
    const redirectTo = getDashboardRedirect(userRole)
    return NextResponse.redirect(new URL(redirectTo, req.url))
  }

  if (protectedRoutes.admin.some(route => path.startsWith(route))) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
    if (userRole !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard/client', req.url))
    }
  }

  if (protectedRoutes.lawyer.some(route => path.startsWith(route))) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
    if (userRole !== 'lawyer' && userRole !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard/client', req.url))
    }
  }

  if (protectedRoutes.client.some(route => path.startsWith(route))) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
  }

  const securityHeaders: Record<string, string> = {
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  }

  Object.entries(securityHeaders).forEach(([key, value]) => {
    res.headers.set(key, value)
  })

  return res
}

function getDashboardRedirect(role: string | null): string {
  switch (role) {
    case 'admin':
      return '/dashboard/admin'
    case 'lawyer':
      return '/dashboard/lawyer'
    default:
      return '/dashboard/client'
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public|api/webhook).*)'],
}
