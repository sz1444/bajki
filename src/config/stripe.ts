export const stripeConfig = {
  publicKey: import.meta.env.VITE_STRIPE_PUBLIC_KEY || '',
  prices: {
    basic: import.meta.env.VITE_STRIPE_PRICE_BASIC || '', // 19.99 PLN - 4 stories/month
    premium: import.meta.env.VITE_STRIPE_PRICE_PREMIUM || '', // 59.99 PLN - unlimited
    annual: import.meta.env.VITE_STRIPE_PRICE_ANNUAL || '' // 49.99 PLN/month (599 PLN/year) - unlimited
  }
}

export type PlanType = 'basic' | 'premium' | 'annual'

export const planDetails: Record<PlanType, {
  name: string
  price: number
  priceId: string
  storiesLimit: number | null // null = unlimited
  features: string[]
}> = {
  basic: {
    name: 'Plan Basic',
    price: 19.99,
    priceId: stripeConfig.prices.basic,
    storiesLimit: 4,
    features: [
      '4 audiobooki na miesiąc',
      'Pełna personalizacja',
      'Wersje Audio MP3',
      'Standardowy Lektor',
      'Anulowanie w dowolnym momencie'
    ]
  },
  premium: {
    name: 'Plan Premium',
    price: 59.99,
    priceId: stripeConfig.prices.premium,
    storiesLimit: null,
    features: [
      'Nielimitowane bajki 10-minutowe',
      'Pełna personalizacja',
      'Generowanie wersji Audio MP3',
      'Premium Lektor',
      'Anulowanie w dowolnym momencie'
    ]
  },
  annual: {
    name: 'Plan Roczny Premium',
    price: 49.99,
    priceId: stripeConfig.prices.annual,
    storiesLimit: null,
    features: [
      'Nielimitowane bajki 10-minutowe',
      'Pełna personalizacja',
      'Generowanie wersji Audio MP3',
      'Premium Lektor',
      'Anulowanie w dowolnym momencie',
      'Najlepsza cena - oszczędzasz 120 PLN'
    ]
  }
}
