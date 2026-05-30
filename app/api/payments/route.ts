import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

// POST /api/payments/create-payment-intent
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { appointmentId, amount } = body

    const supabase = createClient()

    // Get appointment
    const { data: appointment, error: aptError } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', appointmentId)
      .eq('client_id', session.user.id)
      .single()

    if (aptError || !appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
    }

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        appointmentId,
        userId: session.user.id,
      },
    })

    // Save payment intent ID
    await supabase
      .from('appointments')
      .update({ payment_intent_id: paymentIntent.id })
      .eq('id', appointmentId)

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    })
  } catch (error) {
    console.error('Create Payment Intent Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/payments/webhook - Stripe webhook
export async function POST_webhook(req: NextRequest) {
  try {
    const body = await req.text()
    const sig = req.headers.get('stripe-signature')!

    const event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )

    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object
        const appointmentId = paymentIntent.metadata.appointmentId

        // Update appointment payment status
        await supabaseAdmin
          .from('appointments')
          .update({ payment_status: 'paid' })
          .eq('id', appointmentId)

        // Create notification
        await supabaseAdmin
          .from('notifications')
          .insert({
            user_id: paymentIntent.metadata.userId,
            title: 'Payment Successful',
            message: `Your payment of $${(paymentIntent.amount / 100).toFixed(2)} was successful`,
            type: 'payment',
          })

        break

      case 'payment_intent.payment_failed':
        const failedIntent = event.data.object
        await supabaseAdmin
          .from('notifications')
          .insert({
            user_id: failedIntent.metadata.userId,
            title: 'Payment Failed',
            message: 'Your payment failed. Please try again.',
            type: 'payment',
          })
        break
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

// POST /api/payments/create-subscription
export async function POST_subscription(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { priceId, planType } = body

    const supabase = createClient()

    // Get or create Stripe customer
    const { data: user } = await supabase
      .from('users')
      .select('stripe_customer_id')
      .eq('id', session.user.id)
      .single()

    let customerId = user?.stripe_customer_id

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: session.user.email!,
        metadata: {
          userId: session.user.id,
        },
      })
      customerId = customer.id

      await supabase
        .from('users')
        .update({ stripe_customer_id: customerId })
        .eq('id', session.user.id)
    }

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
    })

    // Save subscription in database
    await supabase
      .from('subscriptions')
      .upsert({
        user_id: session.user.id,
        stripe_subscription_id: subscription.id,
        stripe_customer_id: customerId,
        plan_type: planType,
        status: subscription.status,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      })

    return NextResponse.json({
      subscriptionId: subscription.id,
      clientSecret: (subscription.latest_invoice as any)?.payment_intent?.client_secret,
    })
  } catch (error) {
    console.error('Create Subscription Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}