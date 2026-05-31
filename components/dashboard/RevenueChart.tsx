'use client'

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

interface RevenueChartProps {
  data?: Array<{ month: string; revenue: number; appointments: number }>
  title?: string
  description?: string
}

const defaultData = [
  { month: 'Jan', revenue: 45000, appointments: 30 },
  { month: 'Feb', revenue: 62000, appointments: 45 },
  { month: 'Mar', revenue: 78000, appointments: 58 },
  { month: 'Apr', revenue: 55000, appointments: 40 },
  { month: 'May', revenue: 90000, appointments: 65 },
  { month: 'Jun', revenue: 105000, appointments: 78 },
  { month: 'Jul', revenue: 95000, appointments: 70 },
]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg shadow-lg p-3 text-sm">
        <p className="font-semibold text-foreground mb-1">{label}</p>
        <p className="text-primary">PKR {payload[0]?.value?.toLocaleString()}</p>
        <p className="text-muted-foreground">{payload[1]?.value} appointments</p>
      </div>
    )
  }
  return null
}

export function RevenueChart({
  data = defaultData,
  title = 'Revenue Overview',
  description = 'Monthly revenue and appointments',
}: RevenueChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(221.2, 83.2%, 53.3%)" stopOpacity={0.2} />
                <stop offset="95%" stopColor="hsl(221.2, 83.2%, 53.3%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(214.3, 31.8%, 91.4%)" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 12, fill: 'hsl(215.4, 16.3%, 46.9%)' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: 'hsl(215.4, 16.3%, 46.9%)' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="hsl(221.2, 83.2%, 53.3%)"
              strokeWidth={2}
              fill="url(#revenueGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
