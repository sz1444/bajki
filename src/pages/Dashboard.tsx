import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useStories } from '@/lib/hooks/useStories'
import { Button } from '@/components/ui/button'
import { Loader2, Plus } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { SubscriptionCard } from '@/components/dashboard/SubscriptionCard'
import { StoriesGrid } from '@/components/dashboard/StoriesGrid'
import { EmptyState } from '@/components/dashboard/EmptyState'

const Dashboard = () => {
  const { profile } = useAuth()
  const { stories, isLoading, deleteStory } = useStories()

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 container py-12">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            Witaj, {profile?.full_name?.split(' ')[0] || 'Użytkowniku'}! 👋
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
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-3xl font-bold mb-1">Twoje Bajki</h2>
              {stories.length > 0 && (
                <p className="text-muted-foreground">
                  Masz {stories.length} {stories.length === 1 ? 'bajkę' : stories.length < 5 ? 'bajki' : 'bajek'}
                </p>
              )}
            </div>

            <Button asChild variant="hero" size="lg" className="gap-2">
              <Link to="/stworz-bajke">
                <Plus className="w-5 h-5" />
                Stwórz Nową Bajkę
              </Link>
            </Button>
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

      <Footer />
    </div>
  )
}

export default Dashboard
