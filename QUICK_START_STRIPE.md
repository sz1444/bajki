# 🚀 Szybki Start - Stripe Integration

## ⚠️ Co musisz zrobić TERAZ:

### 1. Napraw Price IDs (5 minut)

```bash
# 1. Otwórz https://dashboard.stripe.com/test/products
# 2. Dla każdego produktu (Basic, Premium, Annual):
#    - Kliknij na produkt
#    - W sekcji "Pricing" skopiuj Price ID (zaczyna się od price_)
#
# 3. Zaktualizuj .env.local:

VITE_STRIPE_PRICE_BASIC=price_1ABC...  # Zmień tutaj!
VITE_STRIPE_PRICE_PREMIUM=price_1DEF...  # I tutaj!
VITE_STRIPE_PRICE_ANNUAL=price_1GHI...  # I tutaj!

# 4. Restart servera
npm run dev
```

📖 Szczegóły: `HOW_TO_GET_STRIPE_PRICE_IDS.md`

### 2. Wdróż Supabase Edge Functions (10 minut)

```bash
# Zainstaluj Supabase CLI
brew install supabase/tap/supabase

# Zaloguj się
supabase login

# Link projekt (znajdź Project Ref w Supabase Dashboard)
supabase link --project-ref zwwsrtwzqcmiljtlhbmq

# Wdróż funkcje
supabase functions deploy create-checkout-session
supabase functions deploy stripe-webhook

# Ustaw sekrety
supabase secrets set STRIPE_SECRET_KEY=sk_test_XXXXX
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_XXXXX
supabase secrets set APP_URL=http://localhost:8080
```

📖 Pełna instrukcja: `STRIPE_DEPLOYMENT_GUIDE.md`

### 3. Skonfiguruj Stripe Webhook (5 minut)

1. Przejdź do https://dashboard.stripe.com/test/webhooks
2. Kliknij "Add endpoint"
3. URL: `https://zwwsrtwzqcmiljtlhbmq.supabase.co/functions/v1/stripe-webhook`
4. Wybierz eventy:
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
5. Skopiuj **Webhook Secret** (whsec_...)
6. Dodaj do Supabase secrets:
   ```bash
   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_XXXXX
   ```

## ✅ Testowanie

1. Otwórz http://localhost:8081
2. Zaloguj się
3. Przejdź do sekcji "Cennik"
4. Kliknij "Rozpocznij Basic"
5. Użyj testowej karty: `4242 4242 4242 4242`
6. CVV: dowolny 3-cyfrowy
7. Data: przyszła
8. Kod pocztowy: dowolny

Powinieneś zostać przekierowany do Stripe Checkout! 🎉

## 📁 Utworzone pliki:

- ✅ `supabase/functions/create-checkout-session/index.ts` - Tworzenie sesji checkout
- ✅ `supabase/functions/stripe-webhook/index.ts` - Obsługa webhooków Stripe
- ✅ `HOW_TO_GET_STRIPE_PRICE_IDS.md` - Jak znaleźć Price IDs
- ✅ `STRIPE_DEPLOYMENT_GUIDE.md` - Pełna instrukcja wdrożenia
- ✅ Zaktualizowany `src/pages/Checkout.tsx` - Używa Supabase Edge Function

## 🆘 Problemy?

### "Failed to fetch" podczas checkout
- Sprawdź czy wdrożyłeś Edge Functions: `supabase functions list`
- Sprawdź logi: `supabase functions logs create-checkout-session`

### "Invalid price" od Stripe
- Sprawdź czy Price IDs w `.env.local` są poprawne (price_, nie prod_)
- Restart servera: `npm run dev`

### Webhook nie działa
- Sprawdź czy STRIPE_WEBHOOK_SECRET jest ustawiony
- Sprawdź czy webhook endpoint w Stripe ma poprawny URL

## 📚 Kolejne kroki:

1. Przeczytaj `STRIPE_SETUP.md` - tam jest więcej informacji o strukturze tabel
2. Przetestuj wszystkie 3 plany (Basic, Premium, Annual)
3. Sprawdź czy subskrypcja pojawia się w Dashboard
4. Przetestuj anulowanie subskrypcji

---

**Potrzebujesz pomocy?** Sprawdź logi w Supabase Dashboard:
- Project -> Edge Functions -> create-checkout-session -> Logs
