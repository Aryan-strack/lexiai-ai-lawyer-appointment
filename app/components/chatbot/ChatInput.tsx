'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Send } from 'lucide-react'

interface ChatInputProps {
  onSendMessage: (message: string) => void
  disabled?: boolean
}

export function ChatInput({ onSendMessage, disabled }: ChatInputProps) {
  const [message, setMessage] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim() && !disabled) {
      onSendMessage(message)
      setMessage('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t">
      <div className="flex space-x-2">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask me anything about legal matters..."
          disabled={disabled}
          className="flex-1"
        />
        <Button type="submit" size="icon" disabled={disabled || !message.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </form>
  )
}