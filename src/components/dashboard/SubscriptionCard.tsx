import { Link, useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { pl } from 'date-fns/locale'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CreditCard, Calendar, AlertCircle } from 'lucide-react'
import { useSubscription } from '@/lib/hooks/useSubscription'

export const SubscriptionCard = () => {
  const navigate = useNavigate()
  const { subscription, hasActiveSubscription, storiesRemaining, isLoading } = useSubscription()

  const handleChoosePlan = () => {
    navigate('/')
    setTimeout(() => {
      const subscriptionSection = document.getElementById('subscription')
      if (subscriptionSection) {
        subscriptionSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 100)
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!subscription || !hasActiveSubscription) {
    return (
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2">Brak aktywnej subskrypcji</h3>
              <p className="text-muted-foreground mb-4">
                Wybierz plan, aby zacząć tworzyć magiczne bajki dla swojego dziecka!
              </p>
              <Button variant="hero" size="lg" onClick={handleChoosePlan}>
                Wybierz Plan Subskrypcji
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getPlanDetails = () => {
    switch (subscription.plan_type) {
      case 'basic':
        return { name: 'Basic', price: '19,99 zł/miesiąc' }
      case 'premium':
        return { name: 'Premium', price: '59,99 zł/miesiąc' }
      case 'annual':
        return { name: 'Roczny Premium', price: '49,99 zł/miesiąc (599 zł/rok)' }
      default:
        return { name: 'Premium', price: '59,99 zł/miesiąc' }
    }
  }

  const { name: planName, price: planPrice } = getPlanDetails()
  const renewalDate = format(new Date(subscription.current_period_end), 'd MMMM yyyy', { locale: pl })
  const isBasicPlan = subscription.plan_type === 'basic'

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Twoja Subskrypcja
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-2xl font-bold">Plan {planName}</h3>
                <Badge variant={subscription.status === 'active' ? 'default' : 'secondary'}>
                  {subscription.status === 'active' ? 'Aktywna' : subscription.status}
                </Badge>
              </div>
              <p className="text-lg text-muted-foreground">{planPrice}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground pt-4 border-t">
            <Calendar className="w-4 h-4" />
            <span>
              {subscription.cancel_at_period_end ? 'Wygasa: ' : 'Odnowienie: '}
              {renewalDate}
            </span>
          </div>

          {isBasicPlan && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-900 font-medium">
                Pozostałe bajki w tym miesiącu: <span className="font-bold">{storiesRemaining} / 4</span>
              </p>
            </div>
          )}

          {subscription.cancel_at_period_end && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <p className="text-sm text-orange-800">
                Twoja subskrypcja zostanie anulowana po zakończeniu bieżącego okresu rozliczeniowego.
              </p>
            </div>
          )}

          <Button variant="outline" className="w-full" asChild>
            <Link to="/manage-subscription">Zarządzaj subskrypcją</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
