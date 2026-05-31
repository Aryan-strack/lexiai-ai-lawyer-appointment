import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface ChatMessage {
  id?: string
  role: 'user' | 'assistant'
  content: string
  created_at?: string
  intent_detected?: string
  suggested_lawyer_id?: string
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

interface ChatState {
  messages: ChatMessage[]
  sessionId: string | null
  isLoading: boolean
  isTyping: boolean
  intent: string | null
  recommendedLawyers: LawyerRecommendation[]
  error: string | null
  
  // Actions
  addMessage: (message: ChatMessage) => void
  addMessages: (messages: ChatMessage[]) => void
  setMessages: (messages: ChatMessage[]) => void
  setSessionId: (sessionId: string | null) => void
  setLoading: (isLoading: boolean) => void
  setTyping: (isTyping: boolean) => void
  setIntent: (intent: string | null) => void
  setRecommendedLawyers: (lawyers: LawyerRecommendation[]) => void
  setError: (error: string | null) => void
  clearChat: () => void
  removeMessage: (messageId: string) => void
  updateMessage: (messageId: string, content: string) => void
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      messages: [],
      sessionId: null,
      isLoading: false,
      isTyping: false,
      intent: null,
      recommendedLawyers: [],
      error: null,

      addMessage: (message) => {
        set((state) => ({
          messages: [...state.messages, { ...message, created_at: new Date().toISOString() }],
        }))
      },

      addMessages: (messages) => {
        set((state) => ({
          messages: [...state.messages, ...messages],
        }))
      },

      setMessages: (messages) => {
        set({ messages })
      },

      setSessionId: (sessionId) => {
        set({ sessionId })
      },

      setLoading: (isLoading) => {
        set({ isLoading })
      },

      setTyping: (isTyping) => {
        set({ isTyping })
      },

      setIntent: (intent) => {
        set({ intent })
      },

      setRecommendedLawyers: (lawyers) => {
        set({ recommendedLawyers: lawyers })
      },

      setError: (error) => {
        set({ error })
      },

      clearChat: () => {
        set({
          messages: [],
          sessionId: null,
          intent: null,
          recommendedLawyers: [],
          error: null,
        })
      },

      removeMessage: (messageId) => {
        set((state) => ({
          messages: state.messages.filter((m) => m.id !== messageId),
        }))
      },

      updateMessage: (messageId, content) => {
        set((state) => ({
          messages: state.messages.map((m) =>
            m.id === messageId ? { ...m, content } : m
          ),
        }))
      },
    }),
    {
      name: 'chat-storage',
      partialize: (state) => ({
        sessionId: state.sessionId,
        messages: state.messages.slice(-50), // Only persist last 50 messages
      }),
    }
  )
)