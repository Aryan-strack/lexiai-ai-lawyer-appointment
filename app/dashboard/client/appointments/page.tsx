'use client'

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { AppointmentTable } from '@/components/appointments/AppointmentTable'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'

export default function ClientAppointmentsPage() {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  async function fetchAppointments() {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        lawyer:lawyer_id (
          id,
          users:user_id (
            name,
            email,
            avatar_url
          ),
          fee_per_hour
        )
      `)
      .eq('client_id', user?.id)
      .order('appointment_date', { ascending: true })

    if (!error && data) {
      const formatted = data.map((apt: any) => ({
        id: apt.id,
        client_id: apt.client_id,
        lawyer_id: apt.lawyer_id,
        appointment_date: apt.appointment_date,
        duration_minutes: apt.duration_minutes,
        status: apt.status,
        meeting_link: apt.meeting_link,
        fee: apt.fee,
        lawyer_name: apt.lawyer?.users?.name,
        lawyer_avatar: apt.lawyer?.users?.avatar_url,
      }))
      setAppointments(formatted)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    if (user) {
      fetchAppointments()
    }
  }, [user])

  const upcomingAppointments = appointments.filter(apt => 
    apt.status === 'confirmed' && new Date(apt.appointment_date) > new Date()
  )
  const pastAppointments = appointments.filter(apt => 
    apt.status === 'completed' || new Date(apt.appointment_date) < new Date()
  )

  if (isLoading) {
    return (
      <DashboardLayout role="client">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="client">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Appointments</h1>
            <p className="text-muted-foreground mt-1">View and manage your appointments</p>
          </div>
        </div>

        <Tabs defaultValue="upcoming" className="space-y-4">
          <TabsList>
            <TabsTrigger value="upcoming">
              Upcoming ({upcomingAppointments.length})
            </TabsTrigger>
            <TabsTrigger value="past">
              Past ({pastAppointments.length})
            </TabsTrigger>
            <TabsTrigger value="all">
              All ({appointments.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Appointments</CardTitle>
              </CardHeader>
              <CardContent>
                <AppointmentTable appointments={upcomingAppointments} role="client" />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="past">
            <Card>
              <CardHeader>
                <CardTitle>Past Appointments</CardTitle>
              </CardHeader>
              <CardContent>
                <AppointmentTable appointments={pastAppointments} role="client" />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="all">
            <Card>
              <CardHeader>
                <CardTitle>All Appointments</CardTitle>
              </CardHeader>
              <CardContent>
                <AppointmentTable appointments={appointments} role="client" />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}