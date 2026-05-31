import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

// POST /api/payments/webhook - Stripe webhook
export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const sig = req.headers.get('stripe-signature')!

    const event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        const appointmentId = paymentIntent.metadata.appointmentId
        const userId = paymentIntent.metadata.userId

        if (appointmentId) {
          // Update appointment payment status
          await supabaseAdmin
            .from('appointments')
            .update({ payment_status: 'paid' })
            .eq('id', appointmentId)

          // Create notification
          if (userId) {
            await supabaseAdmin
              .from('notifications')
              .insert({
                user_id: userId,
                title: 'Payment Successful',
                message: `Your payment of $${(paymentIntent.amount / 100).toFixed(2)} was successful`,
                type: 'payment',
              })
          }
        }
        break
      }

      case 'payment_intent.payment_failed': {
        const failedIntent = event.data.object as Stripe.PaymentIntent
        const userId = failedIntent.metadata.userId
        
        if (userId) {
          await supabaseAdmin
            .from('notifications')
            .insert({
              user_id: userId,
              title: 'Payment Failed',
              message: 'Your payment failed. Please try again.',
              type: 'payment',
            })
        }
        break
      }
      
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await supabaseAdmin
          .from('subscriptions')
          .update({
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id)
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook Error:', error)
    return NextResponse.json(
      { error: 'Webhook error' },
      { status: 400 }
    )
  }
}
