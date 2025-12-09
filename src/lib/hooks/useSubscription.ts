import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/config/supabase'

interface Subscription {
  id: string
  user_id: string
  stripe_customer_id: string
  stripe_subscription_id: string
  plan_type: 'monthly' | 'yearly'
  status: 'active' | 'canceled' | 'past_due' | 'incomplete' | 'trialing'
  current_period_start: string
  current_period_end: string
  cancel_at_period_end: boolean
  canceled_at: string | null
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
    new Date(subscription.current_period_end) > new Date()
  )

  return {
    subscription,
    hasActiveSubscription,
    isLoading,
    error,
    refetch,
  }
}
