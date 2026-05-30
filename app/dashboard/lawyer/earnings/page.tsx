'use client'

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DollarSign, TrendingUp, Calendar, Download } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { formatDate, formatCurrency } from '@/lib/utils'

export default function LawyerEarningsPage() {
  const { user } = useAuth()
  const [earnings, setEarnings] = useState({
    total: 0,
    thisMonth: 0,
    pending: 0,
    transactions: [],
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchEarnings()
    }
  }, [user])

  const fetchEarnings = async () => {
    const supabase = createClient()
    
    const { data: lawyer } = await supabase
      .from('lawyers')
      .select('id')
      .eq('user_id', user?.id)
      .single()

    if (lawyer) {
      const { data: appointments } = await supabase
        .from('appointments')
        .select('*')
        .eq('lawyer_id', lawyer.id)
        .order('created_at', { ascending: false })

      const total = appointments?.reduce((sum, apt) => sum + (apt.fee || 0), 0) || 0
      
      const thisMonth = appointments
        ?.filter(apt => new Date(apt.created_at).getMonth() === new Date().getMonth())
        .reduce((sum, apt) => sum + (apt.fee || 0), 0) || 0

      const pending = appointments
        ?.filter(apt => apt.payment_status === 'pending')
        .reduce((sum, apt) => sum + (apt.fee || 0), 0) || 0

      setEarnings({
        total,
        thisMonth,
        pending,
        transactions: appointments || [],
      })
    }
    setIsLoading(false)
  }

  const exportEarnings = () => {
    const csv = [
      ['Date', 'Client', 'Amount', 'Status'].join(','),
      ...earnings.transactions.map((t: any) => [
        formatDate(t.created_at),
        t.client_id,
        t.fee,
        t.payment_status,
      ].join(','))
    ].join('\n')
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `earnings_${new Date().toISOString()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Earnings</h1>
            <p className="text-muted-foreground mt-1">Track your income and payouts</p>
          </div>
          <Button variant="outline" onClick={exportEarnings}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(earnings.total)}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(earnings.thisMonth)}</div>
              <p className="text-xs text-green-500">+12% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending Payout</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(earnings.pending)}</div>
              <p className="text-xs text-muted-foreground">Awaiting settlement</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Appointment ID</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {earnings.transactions.map((t: any) => (
                  <TableRow key={t.id}>
                    <TableCell>{formatDate(t.created_at)}</TableCell>
                    <TableCell className="font-mono text-sm">{t.id.slice(0, 8)}...</TableCell>
                    <TableCell className="font-semibold">{formatCurrency(t.fee)}</TableCell>
                    <TableCell>
                      <Badge variant={t.payment_status === 'paid' ? 'success' : 'warning'}>
                        {t.payment_status}
                      </Badge>
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