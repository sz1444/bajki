import type { VercelRequest, VercelResponse } from '@vercel/node'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

// Disable body parsing for webhook signature verification
export const config = {
  api: {
    bodyParser: false,
  },
}

// Helper to read raw body
async function buffer(readable: any) {
  const chunks = []
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  }
  return Buffer.concat(chunks)
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Initialize Stripe
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
      apiVersion: '2025-11-17.clover',
    })

    // Initialize Supabase
    const supabase = createClient(
      process.env.SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    )

    // Get webhook secret
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ''

    // Verify webhook signature
    const signature = req.headers['stripe-signature']
    if (!signature) {
      return res.status(400).json({ error: 'No signature' })
    }

    const rawBody = await buffer(req)
    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message)
      return res.status(400).json({ error: 'Invalid signature' })
    }

    console.log('Webhook event type:', event.type)

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        // Get subscription details
        const subscriptionId = session.subscription as string
        const subscription = await stripe.subscriptions.retrieve(subscriptionId, { expand: ['plan']})

        // Extract metadata
        const userId = session.client_reference_id || session.metadata?.userId
        const planType = session.metadata?.planType || 'premium'

        const now = new Date() // data opłacenia
        let periodEnd = new Date(now)

        if (planType === 'basic') {
          periodEnd.setMonth(periodEnd.getMonth() + 1) // +1 miesiąc
        } else if (planType === 'premium') {
          periodEnd.setFullYear(periodEnd.getFullYear() + 1) // +12 miesięcy
        }

        // do bazy w ISO string
        const current_period_start = now.toISOString()
        const current_period_end = periodEnd.toISOString()

        if (!planType) {
          console.error('planType is required')
          break
        }

        if (!userId) {
          console.error('No userId found in session')
          break
        }

        // Determine stories limit based on plan
        let storiesLimit: number | null = null
        if (planType === 'basic') {
          storiesLimit = 4
        }

        // Create or update subscription in database
        const { error } = await supabase
          .from('subscriptions')
          .upsert(
            {
              user_id: userId,
              stripe_customer_id: session.customer as string,
              stripe_subscription_id: subscriptionId,
              stripe_price_id: subscription.items.data[0].price.id,
              plan_type: planType,
              status: 'active',
              current_period_start: current_period_start,
              current_period_end: current_period_end,
              cancel_at_period_end: false,
              stories_used_this_period: 0,
              stories_limit: storiesLimit,
            },
            {
              onConflict: 'user_id',
            }
          )

        if (error) {
          console.error('Error creating subscription:', error)
          return res.status(500).json({ error: 'Failed to create subscription' })
        }

        console.log('Subscription created for user:', userId)
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription

        // Get userId from metadata
        const userId = subscription.metadata?.userId
        if (!userId) {
          console.error('No userId found in subscription metadata')
          break
        }

        // Update subscription in database
        const { error } = await supabase
          .from('subscriptions')
          .update({
            status: subscription.status,
            cancel_at_period_end: subscription.cancel_at_period_end,
          })
          .eq('stripe_subscription_id', subscription.id)

        if (error) {
          console.error('Error updating subscription:', error)
        } else {
          console.log('Subscription updated:', subscription.id)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription

        // Update subscription status to canceled
        const { error } = await supabase
          .from('subscriptions')
          .update({
            status: 'canceled',
          })
          .eq('stripe_subscription_id', subscription.id)

        if (error) {
          console.error('Error canceling subscription:', error)
        } else {
          console.log('Subscription canceled:', subscription.id)
        }
        break
      }

      default:
        console.log('Unhandled event type:', event.type)
    }

    return res.status(200).json({ received: true })
  } catch (error: any) {
    console.error('Webhook error:', error)
    return res.status(500).json({ error: error.message })
  }
}
