import { User } from './user'
import { Lawyer } from './lawyer'

export type MessageRole = 'user' | 'assistant' | 'system'
export type IntentType = 'legal_question' | 'lawyer_recommendation' | 'appointment_booking' | 'document_help' | 'general_chat'

export interface ChatMessage {
  id: string
  user_id: string
  user?: User
  session_id: string
  role: MessageRole
  content: string
  intent_detected?: IntentType
  suggested_lawyer_id?: string
  suggested_lawyer?: Lawyer
  tokens_used?: number
  created_at: string
}

export interface ChatSession {
  id: string
  user_id: string
  title?: string
  last_message?: string
  message_count: number
  created_at: string
  updated_at: string
}

export interface SendMessageRequest {
  message: string
  session_id?: string
  context?: {
    previous_messages?: ChatMessage[]
    user_context?: Record<string, any>
  }
}

export interface SendMessageResponse {
  message: string
  message_id: string
  session_id: string
  intent: IntentType
  recommended_lawyers?: Lawyer[]
  suggested_actions?: SuggestedAction[]
}

export interface SuggestedAction {
  type: 'book_appointment' | 'view_lawyer' | 'upload_document' | 'learn_more'
  label: string
  data?: Record<string, any>
}

export interface AIUsageStats {
  total_calls: number
  calls_this_month: number
  calls_remaining: number
  limit: number
  reset_date: string
}

export interface DocumentAnalysisResult {
  document_type: string
  summary: string
  key_points: string[]
  risks: string[]
  recommendations: string[]
  confidence_score: number
}

export interface CaseSummaryData {
  client_name: string
  issue: string
  timeline: string
  documents: string[]
  key_facts: string[]
  legal_basis: string[]
  recommended_actions: string[]
}

export interface TranslationResult {
  original_text: string
  translated_text: string
  source_language: string
  target_language: string
}

export interface ChatFilterParams {
  session_id?: string
  startDate?: Date
  endDate?: Date
  intent?: IntentType
  limit?: number
  offset?: number
}