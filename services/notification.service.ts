import { createClient } from '@/lib/supabase/client'
import { RealtimeChannel } from '@supabase/supabase-js'

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: 'appointment' | 'payment' | 'system' | 'ai_update'
  is_read: boolean
  metadata?: Record<string, any>
  created_at: string
}

class NotificationService {
  private supabase = createClient()
  private channel: RealtimeChannel | null = null
  private listeners: ((notification: Notification) => void)[] = []

  async getNotifications(
    limit: number = 50,
    unreadOnly: boolean = false
  ): Promise<{ notifications: Notification[]; unreadCount: number }> {
    let query = this.supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (unreadOnly) {
      query = query.eq('is_read', false)
    }

    const { data, error } = await query

    if (error) throw error

    // Get unread count
    const { count: unreadCount } = await this.supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('is_read', false)

    return {
      notifications: data || [],
      unreadCount: unreadCount || 0,
    }
  }

  async markAsRead(notificationId: string): Promise<void> {
    const { error } = await this.supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)

    if (error) throw error
  }

  async markAllAsRead(): Promise<void> {
    const { error } = await this.supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('is_read', false)

    if (error) throw error
  }

  async deleteNotification(notificationId: string): Promise<void> {
    const { error } = await this.supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId)

    if (error) throw error
  }

  async deleteAllNotifications(): Promise<void> {
    const { error } = await this.supabase
      .from('notifications')
      .delete()
      .eq('is_read', true)

    if (error) throw error
  }

  async sendTestNotification(): Promise<void> {
    const { error } = await this.supabase
      .from('notifications')
      .insert({
        title: 'Test Notification',
        message: 'This is a test notification from LexiAI',
        type: 'system',
      })

    if (error) throw error
  }

  subscribeToNotifications(callback: (notification: Notification) => void): () => void {
    this.listeners.push(callback)

    if (!this.channel) {
      this.channel = this.supabase
        .channel('notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
          },
          (payload) => {
            this.listeners.forEach(listener => listener(payload.new as Notification))
          }
        )
        .subscribe()
    }

    return () => {
      this.listeners = this.listeners.filter(l => l !== callback)
      if (this.listeners.length === 0 && this.channel) {
        this.channel.unsubscribe()
        this.channel = null
      }
    }
  }

  async getNotificationPreferences(): Promise<{
    email: boolean
    push: boolean
    appointment_reminders: boolean
    payment_updates: boolean
    promotional: boolean
  }> {
    const response = await fetch('/api/notifications/preferences')
    if (!response.ok) throw new Error('Failed to fetch preferences')

    return response.json()
  }

  async updateNotificationPreferences(preferences: Partial<{
    email: boolean
    push: boolean
    appointment_reminders: boolean
    payment_updates: boolean
    promotional: boolean
  }>): Promise<void> {
    const response = await fetch('/api/notifications/preferences', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(preferences),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to update preferences')
    }
  }

  async sendAppointmentReminder(appointmentId: string): Promise<void> {
    const response = await fetch('/api/notifications/reminder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ appointmentId }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to send reminder')
    }
  }
}

export const notificationService = new NotificationService()