'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation';
import { useNavigate } from 'react-router-dom'
import { loadStripe } from '@stripe/stripe-js'
import { stripeConfig, planDetails, PlanType } from '@/config/stripe'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Check, Loader2, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'

const stripePromise = loadStripe(stripeConfig.publicKey)

const Checkout = () => {
  const navigate = useNavigate();
  const params = useSearchParams();
  const planType = params.get('plan');
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)

  const plan = planDetails[planType]

  useEffect(() => {
    if (!user) {
      toast.error('Musisz być zalogowany aby kupić subskrypcję')
      navigate('/')
    }
  }, [user, navigate])

  const handleCheckout = async () => {
    if (!user) {
      toast.error('Musisz być zalogowany')
      return
    }

    setLoading(true)
    try {
      const stripe = await stripePromise
      if (!stripe) {
        throw new Error('Stripe nie załadował się poprawnie')
      }

      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: plan.priceId,
          userId: user.id,
          userEmail: user.email,
          planType: planType
        }),
      })

      const session = await response.json()

      if (session.error) {
        throw new Error(session.error)
      }


      toast.info('Przekierowujemy Cię na bezpieczną stronę płatności Stripe...', { duration: 3000 });

      window.location.href = session.url;

    } catch (error) {
      console.error('Error:', error)
      toast.error('Wystąpił błąd podczas przetwarzania płatności')
    } finally {
      setLoading(false)
    }
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Nieprawidłowy plan</h1>
          <Button onClick={() => navigate('/')}>Wróć do strony głównej</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">

      <main className="flex-1 container py-12">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Powrót
        </Button>

        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-2">
            Finalizuj Zakup
          </h1>
          <p className="text-center text-muted-foreground mb-12">
            Wybrałeś {plan.name} - doskonały wybór!
          </p>

          <Card className="border-2 border-primary shadow-xl">
            <CardContent className="p-8">
              <div className="mb-8">
                <h2 className="text-3xl font-bold mb-2">{plan.name}</h2>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-primary">
                    {plan.price.toFixed(2)}
                  </span>
                  <span className="text-xl text-muted-foreground">
                    PLN / {planType === 'annual' ? 'miesiąc' : 'miesiąc'}
                  </span>
                </div>
                {planType === 'annual' && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Płatność roczna: <span className="font-semibold">599 PLN</span>
                  </p>
                )}
              </div>

              <div className="mb-8">
                <h3 className="font-semibold mb-4 text-lg">Co zyskujesz:</h3>
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border-t pt-6 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-muted-foreground">Suma do zapłaty:</span>
                  <span className="text-2xl font-bold">
                    {planType === 'annual' ? '599.00' : plan.price.toFixed(2)} PLN
                  </span>
                </div>
                {planType === 'annual' && (
                  <p className="text-sm text-green-600 text-right">
                    Oszczędzasz 120 PLN rocznie!
                  </p>
                )}
              </div>

              <Button
                onClick={handleCheckout}
                disabled={loading}
                variant="hero"
                size="lg"
                className="w-full h-14 text-lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Przekierowywanie...
                  </>
                ) : (
                  'Przejdź do płatności'
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center mt-4">
                Płatność jest bezpieczna i szyfrowana. Możesz anulować w dowolnym momencie.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

    </div>
  )
}

export default Checkout
