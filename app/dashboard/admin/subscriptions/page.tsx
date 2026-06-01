'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { formatDate, formatCurrency } from '@/lib/utils'

export default function AdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  async function fetchSubscriptions() {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('subscriptions')
      .select(`
        *,
        users:user_id (
          name,
          email
        )
      `)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setSubscriptions(data)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    fetchSubscriptions()
  }, [])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return 'success'
      case 'trialing': return 'warning'
      case 'canceled': return 'secondary'
      case 'past_due': return 'destructive'
      default: return 'default'
    }
  }

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
          <h1 className="text-3xl font-bold">Subscription Management</h1>
          <p className="text-muted-foreground mt-1">Manage user subscriptions and plans</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Subscriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>AI Calls Used</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscriptions.map((sub: any) => (
                  <TableRow key={sub.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{sub.users.name}</p>
                        <p className="text-sm text-muted-foreground">{sub.users.email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="capitalize">{sub.plan_type}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadge(sub.status)}>
                        {sub.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {sub.ai_calls_used} / {sub.ai_calls_limit}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>Start: {formatDate(sub.current_period_start)}</div>
                        <div>End: {formatDate(sub.current_period_end)}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline">
                        Manage
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