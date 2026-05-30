'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'

export default function AppointmentsRedirectPage() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      switch (user.role) {
        case 'admin':
          router.push('/dashboard/admin/appointments')
          break
        case 'lawyer':
          router.push('/dashboard/lawyer/appointments')
          break
        default:
          router.push('/dashboard/client/appointments')
      }
    } else {
      router.push('/login')
    }
  }, [user, router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  )
}