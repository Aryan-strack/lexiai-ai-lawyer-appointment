'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend 
} from 'recharts'
import { Calendar, TrendingUp, Users, Scale, DollarSign } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

export default function AdminAnalyticsPage() {
  const [timeRange, setTimeRange] = useState('30d')
  const [analytics, setAnalytics] = useState({
    userGrowth: [],
    revenueTrend: [],
    lawyerDistribution: [],
    aiUsage: [],
  })
  const [isLoading, setIsLoading] = useState(true)

  const fetchAnalytics = async () => {
    const supabase = createClient()
    
    // Get user growth
    const { data: users } = await supabase
      .from('users')
      .select('created_at')
      .gte('created_at', getDateRange())

    // Get revenue
    const { data: revenue } = await supabase
      .from('appointments')
      .select('created_at, fee')
      .eq('payment_status', 'paid')
      .gte('created_at', getDateRange())

    // Get lawyer distribution by specialization
    const { data: lawyers } = await supabase
      .from('lawyers')
      .select('specialization')

    // Process data
    const userGrowthData = groupByDate(users || [], 'users')
    const revenueData = groupByDate(revenue || [], 'revenue')
    const lawyerDistData = processLawyerDistribution(lawyers || [])

    setAnalytics({
      userGrowth: userGrowthData,
      revenueTrend: revenueData,
      lawyerDistribution: lawyerDistData,
      aiUsage: [
        { name: 'Legal Questions', value: 45 },
        { name: 'Lawyer Search', value: 30 },
        { name: 'Document Help', value: 15 },
        { name: 'Appointments', value: 10 },
      ],
    })
    setIsLoading(false)
  }

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])

    // Get revenue
    const { data: revenue } = await supabase
      .from('appointments')
      .select('created_at, fee')
      .eq('payment_status', 'paid')
      .gte('created_at', getDateRange())

    // Get lawyer distribution by specialization
    const { data: lawyers } = await supabase
      .from('lawyers')
      .select('specialization')

    // Process data
    const userGrowthData = groupByDate(users || [], 'users')
    const revenueData = groupByDate(revenue || [], 'revenue')
    const lawyerDistData = processLawyerDistribution(lawyers || [])

    setAnalytics({
      userGrowth: userGrowthData,
      revenueTrend: revenueData,
      lawyerDistribution: lawyerDistData,
      aiUsage: [
        { name: 'Legal Questions', value: 45 },
        { name: 'Lawyer Search', value: 30 },
        { name: 'Document Help', value: 15 },
        { name: 'Appointments', value: 10 },
      ],
    })
    setIsLoading(false)
  }

  const getDateRange = () => {
    const date = new Date()
    if (timeRange === '7d') date.setDate(date.getDate() - 7)
    if (timeRange === '30d') date.setDate(date.getDate() - 30)
    if (timeRange === '90d') date.setDate(date.getDate() - 90)
    return date.toISOString()
  }

  const groupByDate = (data: any[], key: string) => {
    const grouped: any = {}
    data.forEach(item => {
      const date = new Date(item.created_at).toLocaleDateString()
      if (!grouped[date]) grouped[date] = { date, [key]: 0 }
      if (key === 'revenue') grouped[date][key] += item.fee || 0
      else grouped[date][key] += 1
    })
    return Object.values(grouped).slice(-10)
  }

  const processLawyerDistribution = (lawyers: any[]) => {
    const distribution: any = {}
    lawyers.forEach(lawyer => {
      lawyer.specialization?.forEach((spec: string) => {
        distribution[spec] = (distribution[spec] || 0) + 1
      })
    })
    return Object.entries(distribution).map(([name, value]) => ({ name, value }))
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
            <p className="text-muted-foreground mt-1">Platform insights and metrics</p>
          </div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Charts Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* User Growth */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Growth
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.userGrowth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="users" stroke="#0088FE" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Revenue Trend */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Revenue Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.revenueTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="#00C49F" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Lawyer Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5" />
                Lawyer by Specialization
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.lawyerDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {analytics.lawyerDistribution.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* AI Usage */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                AI Assistant Usage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.aiUsage}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {analytics.aiUsage.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}