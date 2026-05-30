'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar, 
  Clock, 
  Video, 
  MapPin, 
  MessageCircle,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'
import { formatDate, formatTime, formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface AppointmentCardProps {
  appointment: {
    id: string
    client_id: string
    lawyer_id: string
    appointment_date: string
    duration_minutes: number
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled'
    meeting_link?: string
    fee: number
    lawyer_name: string
    lawyer_avatar?: string
    client_name: string
    client_avatar?: string
  }
  role: 'client' | 'lawyer'
  onStatusChange?: (id: string, status: string) => void
}

export function AppointmentCard({ appointment, role, onStatusChange }: AppointmentCardProps) {
  const [isLoading, setIsLoading] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'success'
      case 'pending':
        return 'warning'
      case 'completed':
        return 'default'
      case 'cancelled':
        return 'destructive'
      case 'rescheduled':
        return 'secondary'
      default:
        return 'default'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-3 w-3" />
      case 'cancelled':
        return <XCircle className="h-3 w-3" />
      case 'rescheduled':
        return <AlertCircle className="h-3 w-3" />
      default:
        return null
    }
  }

  const handleStatusUpdate = async (newStatus: string) => {
    setIsLoading(true)
    try {
      await onStatusChange?.(appointment.id, newStatus)
    } finally {
      setIsLoading(false)
    }
  }

  const isUpcoming = new Date(appointment.appointment_date) > new Date()
  const canJoin = appointment.status === 'confirmed' && 
                  appointment.meeting_link && 
                  isUpcoming &&
                  new Date(appointment.appointment_date).getTime() - new Date().getTime() < 3600000

  return (
    <Card className="hover:shadow-lg transition-all duration-200">
      <CardHeader className="p-4 pb-0">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-primary font-semibold">
                {role === 'client' 
                  ? appointment.lawyer_name.charAt(0)
                  : appointment.client_name.charAt(0)
                }
              </span>
            </div>
            <div>
              <p className="font-semibold">
                {role === 'client' ? appointment.lawyer_name : appointment.client_name}
              </p>
              <p className="text-xs text-muted-foreground">
                {role === 'client' ? 'Lawyer' : 'Client'}
              </p>
            </div>
          </div>
          <Badge variant={getStatusColor(appointment.status) as any}>
            <span className="flex items-center gap-1">
              {getStatusIcon(appointment.status)}
              {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
            </span>
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-3 text-sm">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>{formatDate(appointment.appointment_date)}</span>
          <Clock className="h-4 w-4 text-muted-foreground ml-2" />
          <span>{formatTime(appointment.appointment_date)}</span>
          <span className="text-muted-foreground">
            ({appointment.duration_minutes} min)
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground">Fee:</span>
            <span className="font-semibold">{formatCurrency(appointment.fee)}</span>
          </div>
          {canJoin && (
            <Link href={appointment.meeting_link!} target="_blank">
              <Button size="sm" className="gap-2">
                <Video className="h-4 w-4" />
                Join Meeting
              </Button>
            </Link>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex gap-2">
        {appointment.status === 'pending' && role === 'lawyer' && (
          <>
            <Button 
              size="sm" 
              className="flex-1"
              onClick={() => handleStatusUpdate('confirmed')}
              disabled={isLoading}
            >
              Confirm
            </Button>
            <Button 
              size="sm" 
              variant="destructive" 
              className="flex-1"
              onClick={() => handleStatusUpdate('cancelled')}
              disabled={isLoading}
            >
              Decline
            </Button>
          </>
        )}

        {appointment.status === 'confirmed' && isUpcoming && (
          <Button 
            size="sm" 
            variant="outline" 
            className="flex-1 gap-2"
            onClick={() => handleStatusUpdate('rescheduled')}
            disabled={isLoading}
          >
            <Calendar className="h-4 w-4" />
            Reschedule
          </Button>
        )}

        {(appointment.status === 'confirmed' || appointment.status === 'completed') && (
          <Button size="sm" variant="outline" className="flex-1 gap-2">
            <MessageCircle className="h-4 w-4" />
            Message
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}