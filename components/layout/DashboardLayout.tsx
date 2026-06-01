'use client'

import { ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { Navbar } from './Navbar'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface DashboardLayoutProps {
  children: ReactNode
  role: 'admin' | 'lawyer' | 'client'
}

export function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
    if (!isLoading && user && user.role !== role) {
      router.push(`/dashboard/${user.role}`)
    }
  }, [user, isLoading, router, role])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Only check role if we have user data (not loading)
  if (!user) {
    return null
  }

  if (user.role !== role) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Sidebar role={role} />
      <main className="pt-16 pl-64">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  )
}