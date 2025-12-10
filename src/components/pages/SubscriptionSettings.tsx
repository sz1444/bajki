"use client";

import { useSubscription } from "@/lib/hooks/useSubscription";
import SubscriptionManager from "@/components/SubscriptionManager";

export default function SubscriptionSettings() {
  const { subscription, isLoading: loading, error, refetch } = useSubscription();

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-600">
            Błąd: {error instanceof Error ? error.message : 'Nie udało się załadować subskrypcji'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Ustawienia subskrypcji</h1>
        <SubscriptionManager subscription={subscription} onUpdate={refetch} />
      </div>
    </div>
  );
}
