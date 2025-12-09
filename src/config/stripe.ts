export const stripeConfig = {
  publicKey: import.meta.env.VITE_STRIPE_PUBLIC_KEY || '',
  prices: {
    monthly: import.meta.env.VITE_STRIPE_PRICE_MONTHLY || '',
    yearly: import.meta.env.VITE_STRIPE_PRICE_YEARLY || ''
  }
}
