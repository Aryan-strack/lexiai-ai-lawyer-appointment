'use client'

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { DashboardStats } from '@/components/dashboard/DashboardStats'
import { RevenueChart } from '@/components/dashboard/RevenueChart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Scale, Calendar, DollarSign, TrendingUp, Activity } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalLawyers: 0,
    totalAppointments: 0,
    totalRevenue: 0,
    monthlyGrowth: 0,
  })
  const [revenueData, setRevenueData] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()
      
      // Fetch counts
      const [usersCount, lawyersCount, appointmentsCount, revenue] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('lawyers').select('*', { count: 'exact', head: true }),
        supabase.from('appointments').select('*', { count: 'exact', head: true }),
        supabase.from('appointments').select('fee').eq('payment_status', 'paid'),
      ])

      const totalRevenue = revenue.data?.reduce((sum, apt) => sum + (apt.fee || 0), 0) || 0

      setStats({
        totalUsers: usersCount.count || 0,
        totalLawyers: lawyersCount.count || 0,
        totalAppointments: appointmentsCount.count || 0,
        totalRevenue,
        monthlyGrowth: 12.5,
      })

      // Fetch revenue chart data
      const { data: appointments } = await supabase
        .from('appointments')
        .select('created_at, fee')
        .eq('payment_status', 'paid')
        .gte('created_at', new Date(new Date().setMonth(new Date().getMonth() - 6)).toISOString())

      const monthlyData = groupByMonth(appointments || [])
      setRevenueData(monthlyData)
      setIsLoading(false)
    }

    fetchData()
  }, [])

  const groupByMonth = (appointments: any[]) => {
    const months: any = {}
    appointments.forEach(apt => {
      const month = new Date(apt.created_at).toLocaleString('default', { month: 'short' })
      if (!months[month]) {
        months[month] = { revenue: 0, appointments: 0 }
      }
      months[month].revenue += apt.fee || 0
      months[month].appointments += 1
    })
    return Object.entries(months).map(([month, data]: [string, any]) => ({
      month,
      revenue: data.revenue,
      appointments: data.appointments,
    }))
  }

  const statItems = [
    {
      title: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      icon: <Users className="h-4 w-4 text-primary" />,
      change: stats.monthlyGrowth,
      trend: 'up' as const,
    },
    {
      title: 'Total Lawyers',
      value: stats.totalLawyers.toLocaleString(),
      icon: <Scale className="h-4 w-4 text-primary" />,
      change: 8.2,
      trend: 'up' as const,
    },
    {
      title: 'Appointments',
      value: stats.totalAppointments.toLocaleString(),
      icon: <Calendar className="h-4 w-4 text-primary" />,
      change: 15.3,
      trend: 'up' as const,
    },
    {
      title: 'Revenue',
      value: `$${stats.totalRevenue.toLocaleString()}`,
      icon: <DollarSign className="h-4 w-4 text-primary" />,
      change: 22.5,
      trend: 'up' as const,
    },
  ]

  if (isLoading) {
    return (
      <DashboardLayout role="admin">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of your platform</p>
        </div>

        <DashboardStats stats={statItems} />

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RevenueChart data={revenueData} />
          </div>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-muted transition-colors">
                  Verify New Lawyers
                </button>
                <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-muted transition-colors">
                  Review Reports
                </button>
                <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-muted transition-colors">
                  Check AI Usage
                </button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3 text-sm">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      <span>New user registered</span>
                      <span className="text-muted-foreground ml-auto">5 min ago</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}