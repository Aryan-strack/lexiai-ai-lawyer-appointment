'use client'

import { create } from 'zustand'
import { notificationService, Notification as AppNotification } from '@/services/notification.service'
import { useEffect } from 'react'

interface NotificationsState {
  notifications: AppNotification[]
  unreadCount: number
  isLoading: boolean
  fetchNotifications: () => Promise<void>
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  deleteNotification: (id: string) => Promise<void>
  deleteAllNotifications: () => Promise<void>
  subscribe: () => () => void
}

export const useNotifications = create<NotificationsState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  fetchNotifications: async () => {
    set({ isLoading: true })
    try {
      const { notifications, unreadCount } = await notificationService.getNotifications()
      set({ notifications, unreadCount, isLoading: false })
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
      set({ isLoading: false })
    }
  },

  markAsRead: async (id: string) => {
    try {
      await notificationService.markAsRead(id)
      const { notifications } = get()
      const updated = notifications.map(n =>
        n.id === id ? { ...n, is_read: true } : n
      )
      const newUnreadCount = updated.filter(n => !n.is_read).length
      set({ notifications: updated, unreadCount: newUnreadCount })
    } catch (error) {
      console.error('Failed to mark as read:', error)
    }
  },

  markAllAsRead: async () => {
    try {
      await notificationService.markAllAsRead()
      const { notifications } = get()
      const updated = notifications.map(n => ({ ...n, is_read: true }))
      set({ notifications: updated, unreadCount: 0 })
    } catch (error) {
      console.error('Failed to mark all as read:', error)
    }
  },

  deleteNotification: async (id: string) => {
    try {
      await notificationService.deleteNotification(id)
      const { notifications } = get()
      const updated = notifications.filter(n => n.id !== id)
      const unreadCount = updated.filter(n => !n.is_read).length
      set({ notifications: updated, unreadCount })
    } catch (error) {
      console.error('Failed to delete notification:', error)
    }
  },

  deleteAllNotifications: async () => {
    try {
      await notificationService.deleteAllNotifications()
      set({ notifications: [], unreadCount: 0 })
    } catch (error) {
      console.error('Failed to delete all notifications:', error)
    }
  },

  subscribe: () => {
    const handleNewNotification = (notification: AppNotification) => {
      set(state => ({
        notifications: [notification, ...state.notifications],
        unreadCount: state.unreadCount + 1,
      }))

      // Show browser notification if permitted
      if (Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/icon.png',
        })
      }
    }

    const unsubscribe = notificationService.subscribeToNotifications(handleNewNotification)
    
    // Request notification permission
    if (typeof window !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission()
    }

    return unsubscribe
  },
}))

// React hook to use notifications with auto-subscription
export function useNotificationsAuto() {
  const state = useNotifications()
  
  useEffect(() => {
    state.fetchNotifications()
    const unsubscribe = state.subscribe()
    return () => unsubscribe()
  }, [])

  return state
}