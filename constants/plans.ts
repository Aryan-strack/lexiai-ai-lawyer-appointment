import { Crown, Star, Sparkles } from 'lucide-react'

export const PLANS = {
  FREE: 'free',
  BASIC: 'basic',
  PRO: 'pro',
  ENTERPRISE: 'enterprise',
} as const

export type PlanType = typeof PLANS[keyof typeof PLANS]

export const PLAN_LABELS: Record<PlanType, string> = {
  [PLANS.FREE]: 'Free',
  [PLANS.BASIC]: 'Basic',
  [PLANS.PRO]: 'Pro',
  [PLANS.ENTERPRISE]: 'Enterprise',
}

export const PLAN_ICONS: Record<PlanType, any> = {
  [PLANS.FREE]: Sparkles,
  [PLANS.BASIC]: Sparkles,
  [PLANS.PRO]: Star,
  [PLANS.ENTERPRISE]: Crown,
}

export const PLAN_FEATURES: Record<PlanType, string[]> = {
  [PLANS.FREE]: [
    'AI Legal Assistant (50 queries/month)',
    'Basic lawyer search',
    'Email support',
    'Document storage (100MB)',
    'Basic profile',
  ],
  [PLANS.BASIC]: [
    'AI Legal Assistant (200 queries/month)',
    'Advanced lawyer search',
    'Priority email support',
    'Document storage (2GB)',
    'Appointment reminders',
    'Basic analytics',
  ],
  [PLANS.PRO]: [
    'Unlimited AI queries',
    'Priority lawyer matching',
    '24/7 priority support',
    'Document storage (10GB)',
    'Video consultations',
    'AI case summaries',
    'Advanced analytics',
    'API access',
  ],
  [PLANS.ENTERPRISE]: [
    'Everything in Pro',
    'Custom AI model training',
    'Dedicated account manager',
    'Unlimited storage',
    'SLA guarantee',
    'White-label options',
    'Custom integrations',
    'On-premise deployment',
  ],
}

export const PLAN_LIMITS: Record<PlanType, {
  ai_calls: number
  storage_mb: number
  max_appointments_per_month: number
  max_document_size_mb: number
}> = {
  [PLANS.FREE]: {
    ai_calls: 50,
    storage_mb: 100,
    max_appointments_per_month: 5,
    max_document_size_mb: 5,
  },
  [PLANS.BASIC]: {
    ai_calls: 200,
    storage_mb: 2000,
    max_appointments_per_month: 20,
    max_document_size_mb: 10,
  },
  [PLANS.PRO]: {
    ai_calls: -1, // unlimited
    storage_mb: 10240,
    max_appointments_per_month: -1,
    max_document_size_mb: 50,
  },
  [PLANS.ENTERPRISE]: {
    ai_calls: -1,
    storage_mb: -1,
    max_appointments_per_month: -1,
    max_document_size_mb: 100,
  },
}

export const PLAN_PRICES = {
  monthly: {
    [PLANS.FREE]: 0,
    [PLANS.BASIC]: 19,
    [PLANS.PRO]: 49,
    [PLANS.ENTERPRISE]: 199,
  },
  yearly: {
    [PLANS.FREE]: 0,
    [PLANS.BASIC]: 190, // Save $38/year
    [PLANS.PRO]: 490, // Save $98/year
    [PLANS.ENTERPRISE]: 1990, // Save $398/year
  },
}

export const PLAN_STRIPE_PRICE_IDS = {
  monthly: {
    [PLANS.BASIC]: 'price_basic_monthly',
    [PLANS.PRO]: 'price_pro_monthly',
    [PLANS.ENTERPRISE]: 'price_enterprise_monthly',
  },
  yearly: {
    [PLANS.BASIC]: 'price_basic_yearly',
    [PLANS.PRO]: 'price_pro_yearly',
    [PLANS.ENTERPRISE]: 'price_enterprise_yearly',
  },
}

export const DEFAULT_PLAN = PLANS.FREE

export const TRIAL_DAYS = 14

export const BILLING_PERIODS = {
  MONTHLY: 'monthly',
  YEARLY: 'yearly',
} as const

export type BillingPeriod = typeof BILLING_PERIODS[keyof typeof BILLING_PERIODS]