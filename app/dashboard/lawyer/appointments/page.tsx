'use client'

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { AppointmentTable } from '@/components/appointments/AppointmentTable'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'react-hot-toast'

export default function LawyerAppointmentsPage() {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchAppointments()
    }
  }, [user])

  const fetchAppointments = async () => {
    const supabase = createClient()
    
    const { data: lawyer } = await supabase
      .from('lawyers')
      .select('id')
      .eq('user_id', user?.id)
      .single()

    if (lawyer) {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          client:client_id (
            name,
            email,
            avatar_url
          )
        `)
        .eq('lawyer_id', lawyer.id)
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
          client_name: apt.client.name,
          client_avatar: apt.client.avatar_url,
        }))
        setAppointments(formatted)
      }
    }
    setIsLoading(false)
  }

  const handleStatusChange = async (appointmentId: string, newStatus: string) => {
    const supabase = createClient()
    const { error } = await supabase
      .from('appointments')
      .update({ status: newStatus })
      .eq('id', appointmentId)

    if (error) {
      toast.error('Failed to update appointment')
    } else {
      toast.success(`Appointment ${newStatus}`)
      fetchAppointments()
    }
  }

  const pendingAppointments = appointments.filter(apt => apt.status === 'pending')
  const upcomingAppointments = appointments.filter(apt => 
    apt.status === 'confirmed' && new Date(apt.appointment_date) > new Date()
  )
  const pastAppointments = appointments.filter(apt => 
    apt.status === 'completed' || new Date(apt.appointment_date) < new Date()
  )

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
          <h1 className="text-3xl font-bold">Appointments</h1>
          <p className="text-muted-foreground mt-1">Manage your client appointments</p>
        </div>

        <Tabs defaultValue="upcoming" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending">
              Pending ({pendingAppointments.length})
            </TabsTrigger>
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

          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle>Pending Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <AppointmentTable 
                  appointments={pendingAppointments} 
                  role="lawyer"
                  onStatusChange={handleStatusChange}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="upcoming">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Appointments</CardTitle>
              </CardHeader>
              <CardContent>
                <AppointmentTable 
                  appointments={upcomingAppointments} 
                  role="lawyer"
                  onStatusChange={handleStatusChange}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="past">
            <Card>
              <CardHeader>
                <CardTitle>Past Appointments</CardTitle>
              </CardHeader>
              <CardContent>
                <AppointmentTable 
                  appointments={pastAppointments} 
                  role="lawyer"
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="all">
            <Card>
              <CardHeader>
                <CardTitle>All Appointments</CardTitle>
              </CardHeader>
              <CardContent>
                <AppointmentTable 
                  appointments={appointments} 
                  role="lawyer"
                  onStatusChange={handleStatusChange}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}