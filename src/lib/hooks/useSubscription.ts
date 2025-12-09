import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/config/supabase'

export interface Subscription {
  id: string
  user_id: string
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  stripe_price_id: string
  plan_type: 'basic' | 'premium' | 'annual'
  status: 'active' | 'canceled' | 'past_due' | 'incomplete' | 'trialing'
  current_period_start: string | null
  current_period_end: string | null
  cancel_at_period_end: boolean
  stories_used_this_period: number
  stories_limit: number | null // null = unlimited
  created_at: string
  updated_at: string
}

export const useSubscription = () => {
  const { user } = useAuth()

  const { data: subscription, isLoading, error, refetch } = useQuery({
    queryKey: ['subscription', user?.id],
    queryFn: async () => {
      if (!user) return null

      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle()

      if (error) {
        console.error('Error fetching subscription:', error)
        // If table doesn't exist yet (schema not run), return null gracefully
        if (error.message?.includes('does not exist') || error.code === 'PGRST204' || error.code === '42P01') {
          console.warn('Subscriptions table does not exist yet. Please run the SQL schema.')
          return null
        }
        return null // Return null instead of throwing to prevent infinite loading
      }

      return data as Subscription | null
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1, // Only retry once to avoid long loading times
  })

  const hasActiveSubscription = Boolean(
    subscription &&
    subscription.status === 'active' &&
    (subscription.current_period_end === null || new Date(subscription.current_period_end) > new Date())
  )

  const canCreateStory = subscription
    ? subscription.stories_limit === null ||
      subscription.stories_used_this_period < subscription.stories_limit
    : false

  const storiesRemaining = subscription?.stories_limit
    ? subscription.stories_limit - subscription.stories_used_this_period
    : null // null = unlimited

  return {
    subscription,
    hasActiveSubscription,
    canCreateStory,
    storiesRemaining,
    isLoading,
    error,
    refetch,
  }
}
