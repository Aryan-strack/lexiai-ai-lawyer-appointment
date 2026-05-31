import { create } from 'zustand'

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

interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  isLoading: boolean
  isConnected: boolean
  
  // Actions
  setNotifications: (notifications: Notification[]) => void
  addNotification: (notification: Notification) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  removeNotification: (id: string) => void
  removeAllNotifications: () => void
  setLoading: (isLoading: boolean) => void
  setConnected: (isConnected: boolean) => void
  getUnreadNotifications: () => Notification[]
  getNotificationsByType: (type: Notification['type']) => Notification[]
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  isConnected: false,

  setNotifications: (notifications) => {
    const unreadCount = notifications.filter((n) => !n.is_read).length
    set({ notifications, unreadCount })
  },

  addNotification: (notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + (notification.is_read ? 0 : 1),
    }))
    
    // Show browser notification if permitted
    if (typeof window !== 'undefined' && Notification.permission === 'granted' && !notification.is_read) {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/icon.png',
      })
    }
  },

  markAsRead: (id) => {
    set((state) => {
      const updated = state.notifications.map((n) =>
        n.id === id ? { ...n, is_read: true } : n
      )
      const unreadCount = updated.filter((n) => !n.is_read).length
      return { notifications: updated, unreadCount }
    })
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, is_read: true })),
      unreadCount: 0,
    }))
  },

  removeNotification: (id) => {
    set((state) => {
      const updated = state.notifications.filter((n) => n.id !== id)
      const unreadCount = updated.filter((n) => !n.is_read).length
      return { notifications: updated, unreadCount }
    })
  },

  removeAllNotifications: () => {
    set({ notifications: [], unreadCount: 0 })
  },

  setLoading: (isLoading) => {
    set({ isLoading })
  },

  setConnected: (isConnected) => {
    set({ isConnected })
  },

  getUnreadNotifications: () => {
    return get().notifications.filter((n) => !n.is_read)
  },

  getNotificationsByType: (type) => {
    return get().notifications.filter((n) => n.type === type)
  },
}))