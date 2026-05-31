import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Check if Supabase is configured
const isSupabaseConfigured =
  !!supabaseUrl &&
  supabaseUrl.startsWith('http') &&
  !!supabaseAnonKey &&
  supabaseAnonKey !== 'your_supabase_anon_key'

const protectedRoutes = {
  admin: ['/dashboard/admin', '/api/admin'],
  lawyer: ['/dashboard/lawyer', '/api/lawyer'],
  client: ['/dashboard/client', '/chat', '/appointments', '/video-consultation'],
  auth: ['/login', '/register', '/forgot-password', '/reset-password'],
}

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({
    request: { headers: req.headers },
  })

  // If Supabase is not configured, allow all requests (dev mode)
  if (!isSupabaseConfigured) {
    console.warn(
      '[LexiAI] Supabase not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env'
    )
    return addSecurityHeaders(res)
  }

  const supabase = createServerClient(supabaseUrl!, supabaseAnonKey!, {
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
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const path = req.nextUrl.pathname
  const isAuthenticated = !!user

  let userRole: string | null = null
  if (isAuthenticated && user) {
    try {
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()
      userRole = userData?.role || null
    } catch {
      // DB might not be set up yet
    }
  }

  // Redirect authenticated users away from auth pages
  if (isAuthenticated && protectedRoutes.auth.some((route) => path.startsWith(route))) {
    const redirectTo = getDashboardRedirect(userRole)
    return NextResponse.redirect(new URL(redirectTo, req.url))
  }

  // Admin routes
  if (protectedRoutes.admin.some((route) => path.startsWith(route))) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
    if (userRole !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard/client', req.url))
    }
  }

  // Lawyer routes
  if (protectedRoutes.lawyer.some((route) => path.startsWith(route))) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
    if (userRole !== 'lawyer' && userRole !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard/client', req.url))
    }
  }

  // Client routes
  if (protectedRoutes.client.some((route) => path.startsWith(route))) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
  }

  return addSecurityHeaders(res)
}

function addSecurityHeaders(res: NextResponse) {
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
