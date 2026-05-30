'use client'

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, MessageCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'

export default function LawyerClientsPage() {
  const { user } = useAuth()
  const [clients, setClients] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchClients()
    }
  }, [user])

  const fetchClients = async () => {
    const supabase = createClient()
    
    const { data: lawyer } = await supabase
      .from('lawyers')
      .select('id')
      .eq('user_id', user?.id)
      .single()

    if (lawyer) {
      const { data: appointments } = await supabase
        .from('appointments')
        .select(`
          client:client_id (
            id,
            name,
            email,
            phone,
            avatar_url,
            created_at
          )
        `)
        .eq('lawyer_id', lawyer.id)
        .eq('status', 'completed')

      // Get unique clients
      const uniqueClients = new Map()
      appointments?.forEach((apt: any) => {
        if (apt.client && !uniqueClients.has(apt.client.id)) {
          uniqueClients.set(apt.client.id, {
            ...apt.client,
            totalAppointments: 1,
            totalSpent: 0,
          })
        } else if (apt.client) {
          const client = uniqueClients.get(apt.client.id)
          client.totalAppointments += 1
        }
      })

      setClients(Array.from(uniqueClients.values()))
    }
    setIsLoading(false)
  }

  const filteredClients = clients.filter((client: any) =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email.toLowerCase().includes(searchQuery.toLowerCase())
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
          <h1 className="text-3xl font-bold">My Clients</h1>
          <p className="text-muted-foreground mt-1">View and manage your clients</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Client Directory</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search clients..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Total Appointments</TableHead>
                  <TableHead>Member Since</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map((client: any) => (
                  <TableRow key={client.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>{client.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{client.name}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{client.email}</p>
                        <p className="text-muted-foreground">{client.phone || 'No phone'}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{client.totalAppointments} appointments</Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(client.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="ghost">
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}