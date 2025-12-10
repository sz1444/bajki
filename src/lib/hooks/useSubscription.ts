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
  stories_limit: number | null // null = unlimited monthly
  daily_stories_limit: number // Daily limit (default: 4 for all plans)
  stories_used_today: number // Stories generated today
  last_daily_reset_date: string // Date of last daily reset
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

      if (!data) return null

      // Check if we need to reset the daily counter
      const today = new Date().toISOString().split('T')[0]
      const lastReset = data.last_daily_reset_date

      if (lastReset !== today) {
        // Reset daily counter because it's a new day
        const { error: resetError } = await supabase
          .from('subscriptions')
          .update({
            stories_used_today: 0,
            last_daily_reset_date: today
          })
          .eq('user_id', user.id)

        if (resetError) {
          console.error('Error resetting daily counter:', resetError)
        } else {
          // Update local data to reflect the reset
          data.stories_used_today = 0
          data.last_daily_reset_date = today
        }
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

  // Monthly limit check (for basic plan)
  const canCreateStoryMonthly = subscription
    ? subscription.stories_limit === null ||
      subscription.stories_used_this_period < subscription.stories_limit
    : false

  // Daily limit check (for all plans)
  const canCreateStoryDaily = subscription
    ? subscription.stories_used_today < subscription.daily_stories_limit
    : false

  // Combined check: must pass both monthly AND daily limits
  const canCreateStory = canCreateStoryMonthly && canCreateStoryDaily

  // Monthly remaining (for basic plan)
  const storiesRemaining = subscription?.stories_limit
    ? subscription.stories_limit - subscription.stories_used_this_period
    : null // null = unlimited

  // Daily remaining (for all plans)
  const dailyStoriesRemaining = subscription
    ? subscription.daily_stories_limit - subscription.stories_used_today
    : 0

  return {
    subscription,
    hasActiveSubscription,
    canCreateStory, // Combined check (monthly AND daily)
    canCreateStoryDaily, // Daily check only
    storiesRemaining, // Monthly remaining
    dailyStoriesRemaining, // Daily remaining
    isLoading,
    error,
    refetch,
  }
}
