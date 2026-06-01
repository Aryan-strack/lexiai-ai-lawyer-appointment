'use client'

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { DashboardStats } from '@/components/dashboard/DashboardStats'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Users, DollarSign, Star } from 'lucide-react'
import { AppointmentCalendar } from '@/components/appointments/AppointmentCalendar'
import { Appointment } from '@/types/appointment'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'

export default function LawyerDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalAppointments: 0,
    totalClients: 0,
    totalEarnings: 0,
    averageRating: 0,
  })
  const [recentAppointments, setRecentAppointments] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  async function fetchDashboardData() {
    const supabase = createClient()
    
    // Get lawyer profile
    const { data: lawyer } = await supabase
      .from('lawyers')
      .select('id')
      .eq('user_id', user?.id)
      .single()

    if (lawyer) {
      // Get appointments
      const { data: appointments } = await supabase
        .from('appointments')
        .select('*, client:client_id(name)')
        .eq('lawyer_id', lawyer.id)
        .order('created_at', { ascending: false })

      // Get unique clients
      const uniqueClients = new Set(appointments?.map(apt => apt.client_id))
      
      // Calculate total earnings
      const totalEarnings = appointments
        ?.filter(apt => apt.payment_status === 'paid')
        .reduce((sum, apt) => sum + (apt.fee || 0), 0) || 0

      setStats({
        totalAppointments: appointments?.length || 0,
        totalClients: uniqueClients.size,
        totalEarnings,
        averageRating: 4.8,
      })

      setRecentAppointments(appointments?.slice(0, 5) || [])
    }
    setIsLoading(false)
  }

  useEffect(() => {
    if (user) {
      fetchDashboardData()
    }
  }, [user])

  const statItems = [
    {
      title: 'Total Appointments',
      value: stats.totalAppointments,
      icon: <Calendar className="h-4 w-4" />,
      change: 12,
      trend: 'up' as const,
    },
    {
      title: 'Total Clients',
      value: stats.totalClients,
      icon: <Users className="h-4 w-4" />,
      change: 8,
      trend: 'up' as const,
    },
    {
      title: 'Total Earnings',
      value: `PKR ${stats.totalEarnings.toLocaleString()}`,
      icon: <DollarSign className="h-4 w-4" />,
      change: 15,
      trend: 'up' as const,
    },
    {
      title: 'Rating',
      value: `${stats.averageRating} ★`,
      icon: <Star className="h-4 w-4" />,
      change: 0.2,
      trend: 'up' as const,
    },
  ]

  if (isLoading) {
    return (
      <DashboardLayout role="lawyer">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="lawyer">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Welcome back!</h1>
          <p className="text-muted-foreground mt-1">Here's what's happening with your practice</p>
        </div>

        <DashboardStats stats={statItems} />

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <AppointmentCalendar />
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Appointments</CardTitle>
              </CardHeader>
              <CardContent>
                 <div className="space-y-3">
                   {recentAppointments.map((apt: Appointment) => (
                     <div key={apt.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted">
                       <div>
                         <p className="font-medium">{apt.client?.name}</p>
                         <p className="text-sm text-muted-foreground">
                           {new Date(apt.appointment_date).toLocaleDateString()}
                         </p>
                       </div>
                       <div className="text-right">
                         <p className="font-semibold">PKR {apt.fee?.toLocaleString()}</p>
                         <p className="text-xs capitalize text-muted-foreground">{apt.status}</p>
                       </div>
                     </div>
                   ))}
                 </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-muted transition-colors">
                  Set Availability
                </button>
                <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-muted transition-colors">
                  Update Profile
                </button>
                <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-muted transition-colors">
                  View Earnings
                </button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}