import { useState } from 'react'

export interface Message {
  role: 'user' | 'assistant'
  content: string
}

export function useAIChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const sendMessage = async (content: string) => {
    setIsLoading(true)
    setMessages(prev => [...prev, { role: 'user', content }])
    
    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          history: messages,
        })
      })
      
      const data = await response.json()
      if (data.reply) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
      }
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const clearChat = () => setMessages([])

  return { messages, isLoading, sendMessage, clearChat }
}
