# Instrukcja wdrożenia Stripe + Supabase Edge Functions

## Krok 1: Popraw Price IDs w `.env.local`

Przeczytaj plik `HOW_TO_GET_STRIPE_PRICE_IDS.md` i zamień Product IDs na Price IDs.

```bash
# W pliku .env.local zmień:
VITE_STRIPE_PRICE_BASIC=price_XXXXXX  # Znajdź w Stripe Dashboard
VITE_STRIPE_PRICE_PREMIUM=price_XXXXXX
VITE_STRIPE_PRICE_ANNUAL=price_XXXXXX
```

## Krok 2: Zainstaluj Supabase CLI

```bash
# macOS/Linux
brew install supabase/tap/supabase

# Lub npm
npm install -g supabase

# Zweryfikuj instalację
supabase --version
```

## Krok 3: Zaloguj się do Supabase

```bash
supabase login
```

## Krok 4: Link do projektu Supabase

```bash
# Znajdź Project ID w Supabase Dashboard (Settings -> General)
supabase link --project-ref <your-project-ref>
```

## Krok 5: Wdróż Edge Function

```bash
# Wdróż funkcję create-checkout-session
supabase functions deploy create-checkout-session
```

## Krok 6: Ustaw Secrets w Supabase

W Supabase Dashboard lub przez CLI, ustaw następujące sekrety:

```bash
# Stripe Secret Key (z https://dashboard.stripe.com/test/apikeys)
supabase secrets set STRIPE_SECRET_KEY=sk_test_XXXXXX

# App URL (twój frontend URL)
supabase secrets set APP_URL=http://localhost:8080
# Lub w produkcji:
supabase secrets set APP_URL=https://twoja-domena.com
```

**LUB** ustaw w Supabase Dashboard:
1. Przejdź do: Project Settings -> Edge Functions -> Environment Variables
2. Dodaj:
   - `STRIPE_SECRET_KEY`: `sk_test_XXXXXX` (z Stripe Dashboard)
   - `APP_URL`: `http://localhost:8080` (lub twój URL)

## Krok 7: Zweryfikuj wdrożenie

```bash
# Testuj funkcję
curl -i --location --request POST \
  'https://zwwsrtwzqcmiljtlhbmq.supabase.co/functions/v1/create-checkout-session' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"priceId":"price_xxx","userId":"user123","userEmail":"test@example.com","planType":"premium"}'
```

## Krok 8: Dodaj Stripe Webhook (WAŻNE!)

### 8.1 Utwórz Webhook Endpoint w Stripe

1. Przejdź do https://dashboard.stripe.com/test/webhooks
2. Kliknij "Add endpoint"
3. URL endpointu:
   ```
   https://zwwsrtwzqcmiljtlhbmq.supabase.co/functions/v1/stripe-webhook
   ```
4. Wybierz eventy:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Zapisz Webhook Secret (zaczyna się od `whsec_`)

### 8.2 Utwórz Edge Function dla Webhook

Potrzebujesz jeszcze jednej funkcji - `stripe-webhook` do obsługi zdarzeń ze Stripe.

Przeczytaj `STRIPE_SETUP.md` - tam jest przykładowy kod dla webhook handlera.

## Krok 9: Testowanie

1. Restart dev servera:
   ```bash
   npm run dev
   ```

2. Otwórz http://localhost:8081
3. Zaloguj się
4. Przejdź do cennika
5. Kliknij "Rozpocznij Basic/Premium/Annual"
6. Powinno przekierować do Stripe Checkout

## Krok 10: Stripe Test Cards

Użyj testowych kart do weryfikacji:

```
Sukces: 4242 4242 4242 4242
Błąd: 4000 0000 0000 0002
```

Dowolny przyszły CVV i kod pocztowy.

## Troubleshooting

### Błąd: "Failed to fetch"
- Sprawdź czy Edge Function jest wdrożona: `supabase functions list`
- Sprawdź logi: `supabase functions logs create-checkout-session`

### Błąd: "Stripe error: Invalid price"
- Sprawdź czy Price IDs w `.env.local` są poprawne
- Upewnij się, że używasz Price IDs (`price_`), nie Product IDs (`prod_`)

### Błąd: "CORS error"
- Edge Function ma już ustawione CORS headers
- Sprawdź czy używasz poprawnego VITE_SUPABASE_URL

## Produkcja

Przed wdrożeniem do produkcji:

1. Zmień Stripe na Live Mode
2. Użyj Live Keys (pk_live_..., sk_live_...)
3. Zaktualizuj webhooks na produkcyjnym URL
4. Ustaw APP_URL na produkcyjny URL
