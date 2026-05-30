import { loadStripe, Stripe } from '@stripe/stripe-js'

export interface PaymentIntent {
  clientSecret: string
  paymentIntentId: string
}

export interface Subscription {
  id: string
  plan_type: 'free' | 'basic' | 'pro' | 'enterprise'
  status: 'active' | 'canceled' | 'past_due' | 'trialing'
  ai_calls_limit: number
  ai_calls_used: number
  current_period_start: string
  current_period_end: string
}

export interface PaymentHistory {
  id: string
  appointment_id: string
  amount: number
  status: 'paid' | 'refunded' | 'pending'
  payment_method: string
  created_at: string
  lawyer_name?: string
}

class PaymentService {
  private stripePromise: Promise<Stripe | null>

  constructor() {
    this.stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
  }

  async createPaymentIntent(appointmentId: string, amount: number): Promise<PaymentIntent> {
    const response = await fetch('/api/payments/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ appointmentId, amount }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to create payment intent')
    }

    return response.json()
  }

  async confirmPayment(clientSecret: string): Promise<boolean> {
    const stripe = await this.stripePromise
    if (!stripe) throw new Error('Stripe failed to load')

    const { error } = await stripe.confirmCardPayment(clientSecret)
    if (error) throw new Error(error.message)

    return true
  }

  async createSubscription(priceId: string, planType: string): Promise<{
    subscriptionId: string
    clientSecret: string
  }> {
    const response = await fetch('/api/payments/create-subscription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceId, planType }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to create subscription')
    }

    return response.json()
  }

  async cancelSubscription(subscriptionId: string): Promise<void> {
    const response = await fetch(`/api/payments/subscriptions/${subscriptionId}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to cancel subscription')
    }
  }

  async getCurrentSubscription(): Promise<Subscription | null> {
    const response = await fetch('/api/payments/subscription')
    if (!response.ok) throw new Error('Failed to fetch subscription')

    return response.json()
  }

  async getPaymentHistory(limit: number = 50): Promise<PaymentHistory[]> {
    const response = await fetch(`/api/payments/history?limit=${limit}`)
    if (!response.ok) throw new Error('Failed to fetch payment history')

    const data = await response.json()
    return data.payments
  }

  async getPaymentMethods(): Promise<any[]> {
    const response = await fetch('/api/payments/methods')
    if (!response.ok) throw new Error('Failed to fetch payment methods')

    const data = await response.json()
    return data.methods
  }

  async addPaymentMethod(paymentMethodId: string): Promise<void> {
    const response = await fetch('/api/payments/methods', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentMethodId }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to add payment method')
    }
  }

  async removePaymentMethod(paymentMethodId: string): Promise<void> {
    const response = await fetch(`/api/payments/methods/${paymentMethodId}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to remove payment method')
    }
  }

  async getPricingPlans(): Promise<any[]> {
    const response = await fetch('/api/payments/plans')
    if (!response.ok) throw new Error('Failed to fetch pricing plans')

    const data = await response.json()
    return data.plans
  }

  async createEasyPaisaPayment(amount: number, mobileNumber: string): Promise<{ paymentUrl: string }> {
    const response = await fetch('/api/payments/easypaisa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, mobileNumber }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to create EasyPaisa payment')
    }

    return response.json()
  }

  async createJazzCashPayment(amount: number, mobileNumber: string): Promise<{ paymentUrl: string }> {
    const response = await fetch('/api/payments/jazzcash', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, mobileNumber }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to create JazzCash payment')
    }

    return response.json()
  }
}

export const paymentService = new PaymentService()