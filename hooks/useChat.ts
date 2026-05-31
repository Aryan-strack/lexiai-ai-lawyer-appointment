'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { aiService, ChatMessage, LawyerRecommendation } from '@/services/ai.service'

interface ChatState {
  messages: ChatMessage[]
  sessionId: string | null
  isLoading: boolean
  intent: string | null
  recommendedLawyers: LawyerRecommendation[]
  sendMessage: (message: string) => Promise<void>
  loadHistory: () => Promise<void>
  clearChat: () => Promise<void>
  createNewSession: () => Promise<void>
}

export const useChat = create<ChatState>()(
  persist(
    (set, get) => ({
      messages: [],
      sessionId: null,
      isLoading: false,
      intent: null,
      recommendedLawyers: [],

      sendMessage: async (message: string) => {
        const { messages, sessionId } = get()
        
        // Add user message to UI
        const userMessage: ChatMessage = {
          role: 'user',
          content: message,
          created_at: new Date().toISOString(),
        }
        
        set(state => ({
          messages: [...state.messages, userMessage],
          isLoading: true,
        }))

        try {
          const response = await aiService.sendMessage(message, sessionId || undefined)
          
          const assistantMessage: ChatMessage = {
            role: 'assistant',
            content: response.response,
            id: response.messageId,
            created_at: new Date().toISOString(),
          }
          
          set(state => ({
            messages: [...state.messages, assistantMessage],
            sessionId: response.messageId ? response.messageId.split('-')[0] : state.sessionId,
            intent: response.intent,
            recommendedLawyers: response.recommendedLawyers || [],
            isLoading: false,
          }))
        } catch (error) {
          console.error('Failed to send message:', error)
          set({ isLoading: false })
          
          // Add error message
          const errorMessage: ChatMessage = {
            role: 'assistant',
            content: 'Sorry, I encountered an error. Please try again.',
            created_at: new Date().toISOString(),
          }
          set(state => ({
            messages: [...state.messages, errorMessage],
          }))
        }
      },

      loadHistory: async () => {
        const { sessionId } = get()
        if (!sessionId) return
        
        set({ isLoading: true })
        try {
          const history = await aiService.getChatHistory(sessionId)
          set({ messages: history, isLoading: false })
        } catch (error) {
          console.error('Failed to load chat history:', error)
          set({ isLoading: false })
        }
      },

      clearChat: async () => {
        const { sessionId } = get()
        set({ isLoading: true })
        try {
          if (sessionId) {
            await aiService.clearChatHistory(sessionId)
          }
          set({ messages: [], sessionId: null, intent: null, recommendedLawyers: [], isLoading: false })
        } catch (error) {
          console.error('Failed to clear chat:', error)
          set({ isLoading: false })
        }
      },

      createNewSession: async () => {
        set({ isLoading: true })
        try {
          const sessionId = await aiService.saveChatSession()
          set({ sessionId, messages: [], isLoading: false })
        } catch (error) {
          console.error('Failed to create session:', error)
          set({ isLoading: false })
        }
      },
    }),
    {
      name: 'chat-storage',
      partialize: (state) => ({ sessionId: state.sessionId }),
    }
  )
)