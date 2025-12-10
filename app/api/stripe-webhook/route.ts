import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  try {
    // Initialize Stripe
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
      apiVersion: '2025-11-17.clover',
    })

    // Initialize Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    )

    // Get webhook secret
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ''

    // Verify webhook signature
    const signature = req.headers.get('stripe-signature')
    if (!signature) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 })
    }

    const rawBody = await req.text()
    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
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
              // Daily limit fields (all plans have 4/day limit)
              daily_stories_limit: 4,
              stories_used_today: 0,
              last_daily_reset_date: new Date().toISOString().split('T')[0],
            },
            {
              onConflict: 'user_id',
            }
          )

        if (error) {
          console.error('Error creating subscription:', error)
          return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 })
        }

        console.log('Subscription created for user:', userId)
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const subAny = subscription as any

        console.log('Updating subscription:', subscription.id, {
          status: subscription.status,
          cancel_at_period_end: subscription.cancel_at_period_end,
          cancel_at: subAny.cancel_at,
        });

        // Update subscription in database - szukamy po stripe_subscription_id (nie metadata!)
        const updateData: any = {
          status: subscription.status,
          cancel_at_period_end: subscription.cancel_at_period_end,
          updated_at: new Date().toISOString(),
        }

        // Add period dates if available
        if (subAny.current_period_start) {
          updateData.current_period_start = new Date(subAny.current_period_start * 1000).toISOString()
        }
        if (subAny.current_period_end) {
          updateData.current_period_end = new Date(subAny.current_period_end * 1000).toISOString()
        }

        const { error } = await supabase
          .from('subscriptions')
          .update(updateData)
          .eq('stripe_subscription_id', subscription.id)

        if (error) {
          console.error('Error updating subscription:', error)
        } else {
          console.log('Subscription updated successfully:', subscription.id)
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

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
