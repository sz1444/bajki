"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface Subscription {
  id: string;
  plan_type: string;
  status: string;
  cancel_at_period_end: boolean;
  current_period_end: string;
  stripe_subscription_id: string;
  stripe_customer_id: string;
}

interface SubscriptionManagerProps {
  subscription: Subscription | null;
  onUpdate?: () => void;
}

export default function SubscriptionManager({ subscription, onUpdate }: SubscriptionManagerProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  console.log('SubscriptionManager - user:', user);
  console.log('SubscriptionManager - subscription:', subscription);

  const handleManageSubscription = async (action: string) => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/manage-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          userId: user.id,
          subscriptionId: subscription?.stripe_subscription_id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to manage subscription');
      }

      // Call onUpdate callback to refresh subscription data
      if (onUpdate) {
        onUpdate();
      }
    } catch (err: any) {
      console.error('Error managing subscription:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!subscription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Zarządzanie subskrypcją</CardTitle>
          <CardDescription>Nie masz aktywnej subskrypcji</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => window.location.href = '/checkout'}>
            Wybierz plan
          </Button>
        </CardContent>
      </Card>
    );
  }

  const isActive = subscription.status === 'active';
  const isCanceling = subscription.cancel_at_period_end;
  const periodEnd = new Date(subscription.current_period_end).toLocaleDateString('pl-PL');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Zarządzanie subskrypcją</CardTitle>
        <CardDescription>
          Plan: <strong className="capitalize">{subscription.plan_type}</strong>
          {' • '}
          Status: <strong className={isActive ? 'text-green-600' : 'text-red-600'}>
            {isActive ? 'Aktywna' : 'Nieaktywna'}
          </strong>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
            {error}
          </div>
        )}

        {isCanceling && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800 text-sm">
            Twoja subskrypcja zostanie anulowana {periodEnd}
          </div>
        )}

        {!isCanceling && isActive && (
          <div className="text-sm text-gray-600">
            Następne odnowienie: {periodEnd}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          {/* Anuluj lub wznów subskrypcję */}
          {isActive && !isCanceling && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" disabled={loading}>
                  Anuluj subskrypcję
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Czy na pewno chcesz anulować?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Twoja subskrypcja zostanie anulowana pod koniec bieżącego okresu rozliczeniowego ({periodEnd}).
                    Do tego czasu będziesz mieć pełny dostęp do wszystkich funkcji.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Nie, zostań</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleManageSubscription('cancel')}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Tak, anuluj
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          {/* Wznów subskrypcję */}
          {isCanceling && (
            <Button
              onClick={() => handleManageSubscription('resume')}
              disabled={loading}
              variant="default"
            >
              {loading ? 'Ładowanie...' : 'Wznów subskrypcję'}
            </Button>
          )}
        </div>

        <div className="text-xs text-gray-500 pt-2 border-t">
          ID subskrypcji: {subscription.stripe_subscription_id}
        </div>
      </CardContent>
    </Card>
  );
}
