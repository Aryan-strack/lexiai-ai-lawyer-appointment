import { createClient } from '@/lib/supabase/client'

export interface ChatMessage {
  id?: string
  role: 'user' | 'assistant'
  content: string
  created_at?: string
}

export interface LawyerRecommendation {
  id: string
  name: string
  specialization: string[]
  experience_years: number
  rating: number
  fee_per_hour: number
  avatar_url?: string
}

class AIService {
  private supabase = createClient()

  async sendMessage(
    message: string,
    sessionId?: string
  ): Promise<{
    response: string
    messageId: string
    intent: string
    recommendedLawyers?: LawyerRecommendation[]
  }> {
    const response = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, sessionId }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to send message')
    }

    return response.json()
  }

  async getChatHistory(sessionId?: string, limit: number = 50): Promise<ChatMessage[]> {
    const url = new URL('/api/ai/history', window.location.origin)
    if (sessionId) url.searchParams.set('sessionId', sessionId)
    url.searchParams.set('limit', limit.toString())

    const response = await fetch(url.toString())
    if (!response.ok) throw new Error('Failed to fetch chat history')

    const data = await response.json()
    return data.messages
  }

  async clearChatHistory(sessionId?: string): Promise<void> {
    const url = new URL('/api/ai/clear', window.location.origin)
    if (sessionId) url.searchParams.set('sessionId', sessionId)

    const response = await fetch(url.toString(), { method: 'DELETE' })
    if (!response.ok) throw new Error('Failed to clear chat history')
  }

  async getAIUsage(): Promise<{ used: number; limit: number }> {
    const response = await fetch('/api/ai/usage')
    if (!response.ok) throw new Error('Failed to fetch AI usage')

    return response.json()
  }

  async analyzeDocument(file: File): Promise<{
    summary: string
    keyPoints: string[]
    risks: string[]
    recommendations: string[]
  }> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch('/api/ai/analyze-document', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) throw new Error('Failed to analyze document')
    return response.json()
  }

  async generateCaseSummary(caseDetails: {
    clientName: string
    issue: string
    timeline: string
    documents: string[]
  }): Promise<string> {
    const response = await fetch('/api/ai/case-summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(caseDetails),
    })

    if (!response.ok) throw new Error('Failed to generate case summary')
    const data = await response.json()
    return data.summary
  }

  async translateText(text: string, targetLanguage: 'urdu' | 'english'): Promise<string> {
    const response = await fetch('/api/ai/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, targetLanguage }),
    })

    if (!response.ok) throw new Error('Failed to translate text')
    const data = await response.json()
    return data.translatedText
  }

  async saveChatSession(): Promise<string> {
    const response = await fetch('/api/ai/session', { method: 'POST' })
    if (!response.ok) throw new Error('Failed to create chat session')
    const data = await response.json()
    return data.sessionId
  }
}

export const aiService = new AIService()