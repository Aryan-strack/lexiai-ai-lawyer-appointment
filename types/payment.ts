export type PaymentMethod = 'credit_card' | 'easypaisa' | 'jazzcash' | 'bank_transfer'
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'
export type PlanType = 'free' | 'basic' | 'pro' | 'enterprise'

export interface Payment {
  id: string
  user_id: string
  appointment_id?: string
  subscription_id?: string
  amount: number
  currency: string
  status: PaymentStatus
  payment_method: PaymentMethod
  stripe_payment_intent_id?: string
  stripe_subscription_id?: string
  metadata?: Record<string, any>
  created_at: string
  updated_at: string
}

export interface Subscription {
  id: string
  user_id: string
  plan_type: PlanType
  stripe_subscription_id?: string
  stripe_customer_id?: string
  price_id?: string
  ai_calls_limit: number
  ai_calls_used: number
  storage_limit_mb: number
  storage_used_mb: number
  status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete'
  trial_ends_at?: string
  current_period_start: string
  current_period_end: string
  canceled_at?: string
  created_at: string
  updated_at: string
}

export interface PricingPlan {
  id: PlanType
  name: string
  price_monthly: number
  price_yearly: number
  price_id_monthly: string
  price_id_yearly: string
  features: string[]
  ai_calls_limit: number
  storage_limit_mb: number
  is_popular: boolean
  icon: string
}

export interface PaymentIntent {
  client_secret: string
  payment_intent_id: string
  amount: number
  currency: string
}

export interface PaymentHistoryItem {
  id: string
  date: string
  description: string
  amount: number
  status: PaymentStatus
  receipt_url?: string
}

export interface CreatePaymentData {
  appointment_id: string
  amount: number
  payment_method: PaymentMethod
  mobile_number?: string // for EasyPaisa/JazzCash
}

export interface CreateSubscriptionData {
  plan_type: PlanType
  billing_period: 'monthly' | 'yearly'
  payment_method: PaymentMethod
}

export interface Transaction {
  id: string
  user_id: string
  type: 'payment' | 'refund' | 'subscription'
  amount: number
  currency: string
  status: PaymentStatus
  description: string
  metadata?: Record<string, any>
  created_at: string
}