"use client";

import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useStories } from '@/lib/hooks/useStories'
import { useSubscription } from '@/lib/hooks/useSubscription'
import { Button } from '@/components/ui/button'
import { Loader2, Plus, Lock } from 'lucide-react'
import { SubscriptionCard } from '@/components/dashboard/SubscriptionCard'
import { StoriesGrid } from '@/components/dashboard/StoriesGrid'
import { EmptyState } from '@/components/dashboard/EmptyState'
import { toast } from 'sonner'

const Dashboard = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { stories, isLoading, deleteStory } = useStories()
  const {
    hasActiveSubscription,
    canCreateStory,
    canCreateStoryDaily,
    storiesRemaining,
    dailyStoriesRemaining,
    subscription
  } = useSubscription()

  const getFirstName = () => {
    const fullName = user?.user_metadata?.full_name
    if (fullName) {
      return fullName.split(' ')[0]
    }
    return user?.email?.split('@')[0] || 'Użytkowniku'
  }

  const handleCreateStoryClick = () => {
    if (!hasActiveSubscription) {
      // Navigate to homepage and scroll to pricing section
      navigate('/')
      setTimeout(() => {
        const subscriptionSection = document.getElementById('subscription')
        if (subscriptionSection) {
          subscriptionSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 100)
      return
    }

    if (!canCreateStory) {
      // Check which limit was exceeded
      if (!canCreateStoryDaily) {
        toast.error(`Wykorzystałeś dzienny limit bajek (${subscription?.daily_stories_limit}/dzień). Spróbuj jutro!`)
      } else {
        toast.error(`Wykorzystałeś miesięczny limit bajek (${subscription?.stories_limit} bajek). Przejdź na plan Premium dla nielimitowanego dostępu!`)
      }
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
  }

  const getButtonText = () => {
    if (!hasActiveSubscription) {
      return 'Wybierz Plan Subskrypcji'
    }
    if (!canCreateStory && subscription?.plan_type === 'basic') {
      return `Limit wyczerpany (${storiesRemaining}/4)`
    }
    return 'Stwórz Nową Bajkę'
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">

      <main className="flex-1 container py-12">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            Witaj, {getFirstName()}! 👋
          </h1>
          <p className="text-muted-foreground text-lg">
            Zarządzaj swoją subskrypcją i bajkami w jednym miejscu
          </p>
        </div>

        {/* Subscription Card */}
        <div className="mb-12">
          <SubscriptionCard />
        </div>

        {/* Stories Section */}
        <div>
          <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
            <div>
              <h2 className="text-3xl font-bold mb-1">Twoje Bajki</h2>
              {stories.length > 0 && (
                <p className="text-muted-foreground">
                  Masz {stories.length} {stories.length === 1 ? 'bajkę' : stories.length < 5 ? 'bajki' : 'bajek'}
                </p>
              )}
            </div>

            <div className="flex flex-col items-end gap-1">
              {hasActiveSubscription && canCreateStory ? (
                <Button asChild variant="hero" size="lg" className="gap-2">
                  <Link to="/stworz-bajke">
                    <Plus className="w-5 h-5" />
                    Stwórz Nową Bajkę
                  </Link>
                </Button>
              ) : (
                <Button
                  variant={hasActiveSubscription ? "outline" : "hero"}
                  size="lg"
                  className="gap-2"
                  onClick={handleCreateStoryClick}
                  disabled={hasActiveSubscription && !canCreateStory}
                >
                  {!hasActiveSubscription ? (
                    <Plus className="w-5 h-5" />
                  ) : (
                    <Lock className="w-5 h-5" />
                  )}
                  {getButtonText()}
                </Button>
              )}
              {hasActiveSubscription && subscription && (
                <div className="text-xs text-gray-500 text-center w-full">
                  Dzisiaj wygenerowano: {subscription.stories_used_today}/{subscription.daily_stories_limit} bajki
                </div>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                <p className="text-muted-foreground">Ładowanie bajek...</p>
              </div>
            </div>
          ) : stories.length > 0 ? (
            <StoriesGrid stories={stories} onDeleteStory={deleteStory} />
          ) : (
            <EmptyState />
          )}
        </div>
      </main>

    </div>
  )
}

export default Dashboard
