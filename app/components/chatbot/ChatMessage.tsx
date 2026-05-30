import { cn } from '@/lib/utils'
import { User, Bot } from 'lucide-react'

interface ChatMessageProps {
  message: {
    role: 'user' | 'assistant'
    content: string
  }
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user'

  return (
    <div className={cn(
      "flex items-start space-x-3 animate-in fade-in slide-in-from-bottom-2 duration-300",
      isUser ? "flex-row-reverse space-x-reverse" : "flex-row"
    )}>
      <div className={cn(
        "flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center",
        isUser ? "bg-primary" : "bg-secondary"
      )}>
        {isUser ? (
          <User className="h-4 w-4 text-primary-foreground" />
        ) : (
          <Bot className="h-4 w-4" />
        )}
      </div>
      <div className={cn(
        "rounded-lg px-4 py-2 max-w-[80%]",
        isUser 
          ? "bg-primary text-primary-foreground" 
          : "bg-secondary text-secondary-foreground"
      )}>
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
      </div>
    </div>
  )
}