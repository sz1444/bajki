# Konfiguracja Stripe dla Subskrypcji

## Krok 1: Uruchom SQL Schema w Supabase

1. Otwórz **Supabase Dashboard**: https://supabase.com/dashboard
2. Wybierz swój projekt
3. Przejdź do **SQL Editor**
4. Wykonaj SQL z pliku `supabase-subscriptions.sql`

## Krok 2: Utwórz Produkty i Ceny w Stripe

1. Zaloguj się do **Stripe Dashboard**: https://dashboard.stripe.com
2. Przejdź do **Products** → **Add Product**

### Produkt 1: Plan Basic
- **Name**: Plan Basic
- **Description**: 4 audiobooki na miesiąc
- **Pricing Model**: Recurring
- **Price**: 19.99 PLN
- **Billing Period**: Monthly
- Skopiuj **Price ID** (zaczyna się od `price_...`)

### Produkt 2: Plan Premium
- **Name**: Plan Premium
- **Description**: Nielimitowane bajki
- **Pricing Model**: Recurring
- **Price**: 59.99 PLN
- **Billing Period**: Monthly
- Skopiuj **Price ID**

### Produkt 3: Plan Roczny Premium
- **Name**: Plan Roczny Premium
- **Description**: Nielimitowane bajki - plan roczny
- **Pricing Model**: Recurring
- **Price**: 599 PLN (49.99 PLN/miesiąc)
- **Billing Period**: Yearly
- Skopiuj **Price ID**

## Krok 3: Skonfiguruj Zmienne Środowiskowe

Utwórz plik `.env` (skopiuj z `.env.example`) i wypełnij:

```env
# Stripe Configuration
VITE_STRIPE_PUBLIC_KEY=pk_test_your_public_key
VITE_STRIPE_PRICE_BASIC=price_basic_id_from_stripe
VITE_STRIPE_PRICE_PREMIUM=price_premium_id_from_stripe
VITE_STRIPE_PRICE_ANNUAL=price_annual_id_from_stripe
```

## Krok 4: Utwórz Backend API dla Stripe Checkout

Musisz utworzyć endpoint `/api/create-checkout-session` który:

1. Tworzy Stripe Checkout Session
2. Zapisuje subscription w bazie danych po sukcesie

### Przykładowy kod (Node.js/Express):

```javascript
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

app.post('/api/create-checkout-session', async (req, res) => {
  const { priceId, userId, userEmail, planType } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      customer_email: userEmail,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.CLIENT_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/checkout/cancel`,
      metadata: {
        userId,
        planType,
      },
    });

    res.json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: error.message });
  }
});
```

## Krok 5: Skonfiguruj Webhook Stripe

1. W Stripe Dashboard przejdź do **Developers** → **Webhooks**
2. Dodaj endpoint webhook: `https://your-domain.com/api/stripe-webhook`
3. Wybierz eventy:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

### Przykładowy kod Webhook:

```javascript
app.post('/api/stripe-webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      // Zapisz subscription w Supabase
      await createSubscription(session);
      break;

    case 'customer.subscription.updated':
      const subscription = event.data.object;
      // Zaktualizuj subscription w Supabase
      await updateSubscription(subscription);
      break;

    case 'customer.subscription.deleted':
      const deletedSubscription = event.data.object;
      // Oznacz subscription jako canceled
      await cancelSubscription(deletedSubscription);
      break;
  }

  res.json({ received: true });
});
```

## Krok 6: Funkcje pomocnicze dla Supabase

```javascript
async function createSubscription(session) {
  const { userId, planType } = session.metadata;

  await supabase.from('subscriptions').insert({
    user_id: userId,
    stripe_customer_id: session.customer,
    stripe_subscription_id: session.subscription,
    stripe_price_id: session.line_items.data[0].price.id,
    plan_type: planType,
    status: 'active',
    stories_limit: planType === 'basic' ? 4 : null,
    current_period_start: new Date(session.current_period_start * 1000),
    current_period_end: new Date(session.current_period_end * 1000),
  });
}
```

## Testowanie

1. Użyj Stripe test cards: https://stripe.com/docs/testing
2. Testowa karta: `4242 4242 4242 4242`
3. CVV: dowolne 3 cyfry
4. Data: dowolna przyszła data

## Produkcja

1. Przejdź z test mode na live mode w Stripe Dashboard
2. Zaktualizuj klucze API w zmiennych środowiskowych
3. Przetestuj flow płatności
4. Upewnij się że webhook działa poprawnie
