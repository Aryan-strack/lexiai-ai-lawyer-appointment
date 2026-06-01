'use client'

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { DashboardStats } from '@/components/dashboard/DashboardStats'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, FileText, MessageSquare, DollarSign, ArrowRight, Clock } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { formatDate, formatTime } from '@/lib/utils'

export default function ClientDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalAppointments: 0,
    totalDocuments: 0,
    totalSpent: 0,
    upcomingAppointments: 0,
  })
  const [upcomingAppointments, setUpcomingAppointments] = useState([])
  const [recentDocuments, setRecentDocuments] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user) {
      const fetchDashboardData = async () => {
        const supabase = createClient()
        
        // Get appointments
        const { data: appointments } = await supabase
          .from('appointments')
          .select(`
            *,
            lawyer:lawyer_id (
              id,
              users:user_id (
                name,
                avatar_url
              )
            )
          `)
          .eq('client_id', user?.id)
          .order('appointment_date', { ascending: true })

        // Get documents
        const { data: documents } = await supabase
          .from('documents')
          .select('*')
          .eq('user_id', user?.id)
          .order('created_at', { ascending: false })
          .limit(5)

        // Calculate stats
        const totalSpent = appointments
          ?.filter(apt => apt.payment_status === 'paid')
          .reduce((sum, apt) => sum + (apt.fee || 0), 0) || 0

        const upcoming = appointments?.filter(
          apt => apt.status === 'confirmed' && new Date(apt.appointment_date) > new Date()
        ) || []

        setStats({
          totalAppointments: appointments?.length || 0,
          totalDocuments: documents?.length || 0,
          totalSpent,
          upcomingAppointments: upcoming.length,
        })

        setUpcomingAppointments(upcoming.slice(0, 5))
        setRecentDocuments(documents || [])
        setIsLoading(false)
      }

      fetchDashboardData()
    }
  }, [user])

  const statItems = [
    {
      title: 'Total Appointments',
      value: stats.totalAppointments,
      icon: <Calendar className="h-4 w-4" />,
    },
    {
      title: 'Documents',
      value: stats.totalDocuments,
      icon: <FileText className="h-4 w-4" />,
    },
    {
      title: 'Total Spent',
      value: `PKR ${stats.totalSpent.toLocaleString()}`,
      icon: <DollarSign className="h-4 w-4" />,
    },
    {
      title: 'Upcoming',
      value: stats.upcomingAppointments,
      icon: <Clock className="h-4 w-4" />,
    },
  ]

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
        <div>
          <h1 className="text-3xl font-bold">Welcome back!</h1>
          <p className="text-muted-foreground mt-1">Here's what's happening with your legal matters</p>
        </div>

        <DashboardStats stats={statItems} />

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Upcoming Appointments */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Upcoming Appointments</CardTitle>
              <Link href="/dashboard/client/appointments">
                <Button variant="ghost" size="sm">
                  View All
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
{upcomingAppointments.length === 0 ? (
                 <div className="text-center py-8">
                   <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                   <p className="text-muted-foreground">No upcoming appointments</p>
                   <Link href="/lawyers">
                     <Button className="mt-4">Book an Appointment</Button>
                   </Link>
                 </div>
               ) : (
                 <div className="space-y-4">
                   {upcomingAppointments.map((apt: any) => (
                     <div key={apt.id} className="flex items-center justify-between p-3 rounded-lg border">
                       <div className="flex items-center gap-3">
                         <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                           <span className="text-primary font-semibold">
                             {apt.lawyer?.users?.name?.charAt(0) ?? ''}
                           </span>
                         </div>
                         <div>
                           <p className="font-medium">{apt.lawyer?.users?.name ?? 'Unknown Lawyer'}</p>
                           <p className="text-sm text-muted-foreground">
                             {formatDate(apt.appointment_date)} at {formatTime(apt.appointment_date)}
                           </p>
                         </div>
                       </div>
                       <div className="text-right">
                         <p className="font-semibold">PKR {apt.fee?.toLocaleString() ?? '0'}</p>
                         <p className="text-xs capitalize text-muted-foreground">{apt.status ?? 'unknown'}</p>
                       </div>
                     </div>
                   ))}
                 </div>
               )}
            </CardContent>
          </Card>

          {/* Recent Documents */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Documents</CardTitle>
              <Link href="/dashboard/client/documents">
                <Button variant="ghost" size="sm">
                  View All
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {recentDocuments.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No documents yet</p>
                  <Link href="/dashboard/client/documents/upload">
                    <Button className="mt-4">Upload Document</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentDocuments.map((doc: any) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted">
                      <div className="flex items-center gap-3">
                        <FileText className="h-8 w-8 text-primary" />
                        <div>
                          <p className="font-medium">{doc.file_name}</p>
                          <p className="text-xs text-muted-foreground">
                            Uploaded {new Date(doc.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Button size="sm" variant="ghost">
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/lawyers">
                <Button variant="outline" className="w-full gap-2">
                  <Calendar className="h-4 w-4" />
                  Book Appointment
                </Button>
              </Link>
              <Link href="/ai-assistant">
                <Button variant="outline" className="w-full gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Ask AI Assistant
                </Button>
              </Link>
              <Link href="/dashboard/client/documents/upload">
                <Button variant="outline" className="w-full gap-2">
                  <FileText className="h-4 w-4" />
                  Upload Document
                </Button>
              </Link>
              <Link href="/dashboard/client/payments">
                <Button variant="outline" className="w-full gap-2">
                  <DollarSign className="h-4 w-4" />
                  Make Payment
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}