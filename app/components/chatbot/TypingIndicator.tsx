import { Bot } from 'lucide-react'

export function TypingIndicator() {
  return (
    <div className="flex items-start space-x-3">
      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
        <Bot className="h-4 w-4" />
      </div>
      <div className="bg-secondary rounded-lg px-4 py-2">
        <div className="flex space-x-1">
          <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  )
}