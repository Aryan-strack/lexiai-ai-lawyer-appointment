// Supabase Database types for LexiAI
// Update this file after running: npx supabase gen types typescript --project-id YOUR_PROJECT_ID

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'admin' | 'lawyer' | 'client'
export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled'
export type AppointmentType = 'video' | 'in-person' | 'phone'
export type PaymentStatus = 'pending' | 'paid' | 'refunded' | 'failed'
export type PaymentMethod = 'stripe' | 'easypaisa' | 'jazzcash' | 'bank_transfer'
export type SubscriptionPlan = 'free' | 'basic' | 'pro' | 'enterprise'
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'trialing'
export type NotificationType = 'appointment' | 'payment' | 'message' | 'system' | 'reminder'
export type DocumentType = 'contract' | 'evidence' | 'affidavit' | 'petition' | 'other'

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          role: UserRole
          phone: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          role?: UserRole
          phone?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          role?: UserRole
          phone?: string | null
          avatar_url?: string | null
          updated_at?: string
        }
      }
      lawyers: {
        Row: {
          id: string
          user_id: string
          bar_number: string | null
          specializations: string[]
          experience_years: number
          hourly_rate: number
          bio: string | null
          education: string | null
          verified: boolean
          rating: number
          total_reviews: number
          total_cases: number
          city: string | null
          languages: string[]
          available: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          bar_number?: string | null
          specializations?: string[]
          experience_years?: number
          hourly_rate?: number
          bio?: string | null
          education?: string | null
          verified?: boolean
          rating?: number
          total_reviews?: number
          total_cases?: number
          city?: string | null
          languages?: string[]
          available?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['lawyers']['Insert']>
      }
      appointments: {
        Row: {
          id: string
          client_id: string
          lawyer_id: string
          appointment_date: string
          duration_minutes: number
          type: AppointmentType
          status: AppointmentStatus
          fee: number
          payment_status: PaymentStatus
          payment_method: PaymentMethod | null
          notes: string | null
          meeting_link: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          lawyer_id: string
          appointment_date: string
          duration_minutes?: number
          type?: AppointmentType
          status?: AppointmentStatus
          fee: number
          payment_status?: PaymentStatus
          payment_method?: PaymentMethod | null
          notes?: string | null
          meeting_link?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['appointments']['Insert']>
      }
      reviews: {
        Row: {
          id: string
          client_id: string
          lawyer_id: string
          appointment_id: string
          rating: number
          comment: string | null
          created_at: string
        }
        Insert: {
          id?: string
          client_id: string
          lawyer_id: string
          appointment_id: string
          rating: number
          comment?: string | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['reviews']['Insert']>
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          plan_type: SubscriptionPlan
          status: SubscriptionStatus
          ai_calls_limit: number
          ai_calls_used: number
          stripe_subscription_id: string | null
          current_period_start: string | null
          current_period_end: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan_type?: SubscriptionPlan
          status?: SubscriptionStatus
          ai_calls_limit?: number
          ai_calls_used?: number
          stripe_subscription_id?: string | null
          current_period_start?: string | null
          current_period_end?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['subscriptions']['Insert']>
      }
      documents: {
        Row: {
          id: string
          user_id: string
          appointment_id: string | null
          file_name: string
          file_url: string
          file_size: number
          file_type: string
          document_type: DocumentType
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          appointment_id?: string | null
          file_name: string
          file_url: string
          file_size: number
          file_type: string
          document_type?: DocumentType
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['documents']['Insert']>
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: NotificationType
          title: string
          message: string
          read: boolean
          data: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: NotificationType
          title: string
          message: string
          read?: boolean
          data?: Json | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['notifications']['Insert']>
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      user_role: UserRole
      appointment_status: AppointmentStatus
      appointment_type: AppointmentType
      payment_status: PaymentStatus
      subscription_plan: SubscriptionPlan
    }
  }
}
