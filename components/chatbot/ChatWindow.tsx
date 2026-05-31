'use client'

import { useState, useRef, useEffect } from 'react'
import { ChatMessage } from './ChatMessage'
import { ChatInput } from './ChatInput'
import { TypingIndicator } from './TypingIndicator'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAIChat } from '@/hooks/useAIChat'
import { MessageSquare, X, Minimize2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ChatWindowProps {
  isOpen?: boolean
  onClose?: () => void
  fullScreen?: boolean
}

export function ChatWindow({ isOpen = true, onClose, fullScreen = false }: ChatWindowProps) {
  const [isMinimized, setIsMinimized] = useState(false)
  const { messages, isLoading, sendMessage, clearChat } = useAIChat()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  if (!isOpen) {
    return (
      <Button
        onClick={() => onClose?.()}
        className="fixed bottom-4 right-4 rounded-full shadow-lg p-4 h-auto"
      >
        <MessageSquare className="h-6 w-6" />
      </Button>
    )
  }

  return (
    <Card className={cn(
      "fixed bottom-4 right-4 shadow-2xl flex flex-col transition-all duration-300",
      fullScreen ? "inset-4 w-auto h-auto" : "w-96 h-[600px]",
      isMinimized ? "h-14" : "h-[600px]"
    )}>
      <CardHeader className="p-4 border-b cursor-pointer" onClick={() => setIsMinimized(!isMinimized)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">LexiAI Assistant</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={(e) => {
                e.stopPropagation()
                setIsMinimized(!isMinimized)
              }}
            >
              <Minimize2 className="h-4 w-4" />
            </Button>
            {onClose && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={(e) => {
                  e.stopPropagation()
                  onClose()
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      {!isMinimized && (
        <>
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                <MessageSquare className="h-12 w-12 text-muted-foreground" />
                <div>
                  <p className="text-lg font-semibold">Hello! I'm LexiAI</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    I can help you with legal questions, find lawyers, and book appointments.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 w-full mt-4">
                  <Button variant="outline" size="sm" onClick={() => sendMessage("I need legal advice")}>
                    Legal Advice
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => sendMessage("Find me a lawyer")}>
                    Find Lawyer
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => sendMessage("Book appointment")}>
                    Book Appointment
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => sendMessage("Document help")}>
                    Document Help
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {messages.map((message: any, index: number) => (
                  <ChatMessage key={index} message={message} />
                ))}
                {isLoading && <TypingIndicator />}
                <div ref={messagesEndRef} />
              </>
            )}
          </CardContent>
          <ChatInput onSendMessage={sendMessage} disabled={isLoading} />
        </>
      )}
    </Card>
  )
}