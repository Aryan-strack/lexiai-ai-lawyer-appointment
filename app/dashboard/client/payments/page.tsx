'use client'

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { PaymentHistory } from '@/components/payments/PaymentHistory'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CreditCard, DollarSign, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'

export default function ClientPaymentsPage() {
  const { user } = useAuth()
  const [payments, setPayments] = useState([])
  const [stats, setStats] = useState({
    totalSpent: 0,
    pendingPayments: 0,
    totalTransactions: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  async function fetchPayments() {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        lawyer:lawyer_id (
          users:user_id (
            name
          )
        )
      `)
      .eq('client_id', user?.id)

  useEffect(() => {
    if (user) {
      fetchPayments()
    }
  }, [user])
      .order('created_at', { ascending: false })

    if (!error && data) {
      const formattedPayments = data.map((apt: any) => ({
        id: apt.id,
        appointment_id: apt.id,
        amount: apt.fee,
        status: apt.payment_status,
        payment_method: 'credit_card',
        created_at: apt.created_at,
        lawyer_name: apt.lawyer?.users?.name,
      }))

      setPayments(formattedPayments)
      
      const totalSpent = formattedPayments
        .filter(p => p.status === 'paid')
        .reduce((sum, p) => sum + p.amount, 0)
      
      const pendingPayments = formattedPayments
        .filter(p => p.status === 'pending')
        .reduce((sum, p) => sum + p.amount, 0)

      setStats({
        totalSpent,
        pendingPayments,
        totalTransactions: formattedPayments.length,
      })
    }
    setIsLoading(false)
  }

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
          <h1 className="text-3xl font-bold">Payments</h1>
          <p className="text-muted-foreground mt-1">View your payment history and manage billing</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalSpent.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.pendingPayments.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Awaiting payment</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Transactions</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTransactions}</div>
              <p className="text-xs text-muted-foreground">Total transactions</p>
            </CardContent>
          </Card>
        </div>

        <PaymentHistory payments={payments} role="client" />
      </div>
    </DashboardLayout>
  )
}