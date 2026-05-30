'use client'

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Bell, Calendar, CreditCard, MessageSquare, CheckCheck, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { formatRelativeTime } from '@/lib/utils'
import { toast } from 'react-hot-toast'

export default function ClientNotificationsPage() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchNotifications()
      
      // Subscribe to realtime notifications
      const supabase = createClient()
      const channel = supabase
        .channel('notifications')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        }, (payload) => {
          setNotifications(prev => [payload.new, ...prev])
        })
        .subscribe()

      return () => {
        channel.unsubscribe()
      }
    }
  }, [user])

  const fetchNotifications = async () => {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setNotifications(data)
    }
    setIsLoading(false)
  }

  const markAsRead = async (notificationId: string) => {
    const supabase = createClient()
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)

    if (error) {
      toast.error('Failed to mark as read')
    } else {
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      )
    }
  }

  const markAllAsRead = async () => {
    const supabase = createClient()
    const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id)
    
    if (unreadIds.length === 0) return

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .in('id', unreadIds)

    if (error) {
      toast.error('Failed to mark all as read')
    } else {
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
      toast.success('All notifications marked as read')
    }
  }

  const deleteNotification = async (notificationId: string) => {
    const supabase = createClient()
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId)

    if (error) {
      toast.error('Failed to delete notification')
    } else {
      setNotifications(prev => prev.filter(n => n.id !== notificationId))
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'appointment': return <Calendar className="h-5 w-5 text-blue-500" />
      case 'payment': return <CreditCard className="h-5 w-5 text-green-500" />
      case 'ai_update': return <MessageSquare className="h-5 w-5 text-purple-500" />
      default: return <Bell className="h-5 w-5 text-gray-500" />
    }
  }

  const unreadCount = notifications.filter(n => !n.is_read).length

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
            <h1 className="text-3xl font-bold">Notifications</h1>
            <p className="text-muted-foreground mt-1">
              {unreadCount > 0 ? `You have ${unreadCount} unread notifications` : 'All caught up!'}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" onClick={markAllAsRead}>
              <CheckCheck className="h-4 w-4 mr-2" />
              Mark all as read
            </Button>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Updates</CardTitle>
          </CardHeader>
          <CardContent>
            {notifications.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No notifications</h3>
                <p className="text-muted-foreground">You're all caught up!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {notifications.map((notification: any) => (
                  <div
                    key={notification.id}
                    className={`flex items-start gap-4 p-4 rounded-lg transition-colors ${
                      !notification.is_read ? 'bg-primary/5 border-l-4 border-primary' : 'hover:bg-muted'
                    }`}
                  >
                    <div className="flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{notification.title}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {formatRelativeTime(notification.created_at)}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {!notification.is_read && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => markAsRead(notification.id)}
                            >
                              <CheckCheck className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive"
                            onClick={() => deleteNotification(notification.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}