'use client'

import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ChatWindow } from '@/components/chatbot/ChatWindow'
import { useAuth } from '@/hooks/useAuth'

export default function ChatPage() {
  const { user } = useAuth()

  if (!user) {
    return (
      <div className="min-h-screen pt-20">
        <div className="container mx-auto px-4 max-w-5xl">
          <ChatWindow fullScreen />
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout role={user.role as any}>
      <div className="h-[calc(100vh-8rem)]">
        <ChatWindow fullScreen />
      </div>
    </DashboardLayout>
  )
}