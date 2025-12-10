import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
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

    // Parse request body
    const body = await request.json()
    const { action, userId, subscriptionId } = body

    console.log('Manage subscription request:', { action, userId, subscriptionId });

    // Validate required fields
    if (!action || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get subscription from database (any status, we might want to manage canceled ones too)
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()

    console.log('Subscription query result:', { subscription, subError });

    if (subError) {
      console.error('Error fetching subscription:', subError);
      return NextResponse.json(
        { error: 'Failed to fetch subscription' },
        { status: 500 }
      )
    }

    if (!subscription) {
      console.log('No subscription found for user:', userId);
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      )
    }

    const stripeSubscriptionId = subscriptionId || subscription.stripe_subscription_id

    if (!stripeSubscriptionId) {
      return NextResponse.json(
        { error: 'No Stripe subscription ID found' },
        { status: 400 }
      )
    }

    // Handle different actions
    switch (action) {
      case 'cancel': {
        // Cancel subscription at period end
        const updatedSubscription = await stripe.subscriptions.update(
          stripeSubscriptionId,
          {
            cancel_at_period_end: true,
          }
        )

        // Webhook automatycznie zaktualizuje bazę, ale robimy to też tutaj dla pewności
        await supabase
          .from('subscriptions')
          .update({
            cancel_at_period_end: true,
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', stripeSubscriptionId)

        return NextResponse.json({
          success: true,
          message: 'Subskrypcja zostanie anulowana na koniec okresu rozliczeniowego',
          subscription: updatedSubscription,
        })
      }

      case 'resume': {
        // Resume subscription (remove cancel_at_period_end)
        const updatedSubscription = await stripe.subscriptions.update(
          stripeSubscriptionId,
          {
            cancel_at_period_end: false,
          }
        )

        // Webhook automatycznie zaktualizuje bazę, ale robimy to też tutaj dla pewności
        await supabase
          .from('subscriptions')
          .update({
            cancel_at_period_end: false,
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', stripeSubscriptionId)

        return NextResponse.json({
          success: true,
          message: 'Subskrypcja została wznowiona pomyślnie',
          subscription: updatedSubscription,
        })
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action. Supported: cancel, resume' },
          { status: 400 }
        )
    }
  } catch (error: any) {
    console.error('Error managing subscription:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to manage subscription' },
      { status: 500 }
    )
  }
}
