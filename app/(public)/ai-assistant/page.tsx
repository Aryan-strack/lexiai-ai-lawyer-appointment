'use client'

import { ChatWindow } from '@/components/chatbot/ChatWindow'

export default function AIAssistantPage() {
  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            AI Legal Assistant
          </h1>
          <p className="text-xl text-muted-foreground">
            Get instant answers to your legal questions. Our AI is available 24/7.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            *AI provides informational guidance only. For legal advice, consult a qualified lawyer.
          </p>
        </div>
        
        <ChatWindow fullScreen />
      </div>
    </div>
  )
}