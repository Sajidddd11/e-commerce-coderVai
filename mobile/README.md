# ZAHAN Mobile App

React Native (Expo) mobile app for the ZAHAN e-commerce storefront. Built to match the web experience in `demo-clothing-store-storefront` — same brand, features, and Medusa backend.

## Status

**Phases 0–6 built and bundling cleanly** (`tsc` passes, `expo export` succeeds). Phase 7 is QA/release against a live backend.

Implemented:

- Expo Router app with bottom tabs: Home, Shop, Cart, Account
- Design tokens + typography wired (Inter + Montserrat via `expo-font`)
- Medusa SDK + secure storage (JWT in SecureStore, cart id in AsyncStorage)
- Zustand stores: region, cart, auth, checkout draft
- Data layer ported from web: regions, products, categories, collections, cart, customer, **checkout, payment, fulfillment, orders, sslcommerz, password-reset, enhancements**
- UI kit: Button, Input, Card, Badge, Skeleton, ThemedText
- Product browsing: ProductCard/Grid/Rail, Home feed (hero carousel, categories, best-selling, featured collections, trust, CTA, footer), Shop (search + suggestions + category filter + sort + infinite scroll), Product detail (gallery, variants, Add to Cart, Buy Now, related products, reviews)
- **Cart** — qty update, remove, promo code, free-shipping nudge
- **Checkout** — consolidated form (contact, address, district picker, delivery type, shipping option, payment method) → review → place order
- **Payments** — Cash on Delivery + SSLCommerz (cards / bKash / Nagad) via in-app browser + deep-link callback
- **Account** — login/register/logout, profile, addresses (CRUD), orders (list + detail), order transfer, password reset (SMS OTP, 3 steps)
- **Static pages** — about, contact, offers, returns, shipping-info, privacy-policy, terms-of-service
- **Integrations** — WhatsApp FAB, social links, Facebook analytics events (native SDK optional)

> Several home/checkout features rely on custom backend routes (hero-slides, best-selling, search-suggestions, free-shipping-threshold, reviews, send-sms, password OTP). Each fails gracefully with a fallback if the route is unavailable.

Next: **Phase 7** — QA against a live Medusa backend, copy real banner/payment assets into `assets/`, device testing, EAS build. See [MOBILE_BUILD_GUIDE.md](./MOBILE_BUILD_GUIDE.md) §18.

## Run it

```bash
cd mobile
# .env already created from .env.example — edit it with your real backend:
#   EXPO_PUBLIC_MEDUSA_BACKEND_URL, EXPO_PUBLIC_MEDUSA_PUBLISHABLE_KEY
npm run start          # then press i (iOS) / a (Android), or scan QR in Expo Go
npm run typecheck      # tsc --noEmit
```

> Without a reachable Medusa backend + publishable key, screens render but product/cart data stays empty.

## Continue building

1. Read **[MOBILE_BUILD_GUIDE.md](./MOBILE_BUILD_GUIDE.md)** — full implementation spec.
2. Use design tokens from `design/` — do not invent colors or fonts.
3. Use **[AI_START_PROMPT.md](./AI_START_PROMPT.md)** with the Phase 2 prompt to continue.

## Folder Structure (target)

```
mobile/
├── MOBILE_BUILD_GUIDE.md    ← Master spec (read this first)
├── AI_START_PROMPT.md       ← Copy-paste prompt for AI agents
├── design/                  ← Theme tokens (use as source of truth)
│   ├── theme.ts
│   ├── typography.ts
│   └── constants.ts
├── app/                     ← Expo Router screens (created during build)
├── src/
│   ├── api/                 ← Medusa SDK + custom endpoints
│   ├── components/          ← UI components
│   ├── hooks/
│   ├── stores/              ← Zustand state (cart, auth, region)
│   └── utils/
└── assets/                  ← Logos, banners, payment icons
```

## Web Reference

| Web path | Purpose |
|----------|---------|
| `demo-clothing-store-storefront/` | Next.js storefront to mirror |
| `demo-clothing-store/` | Medusa backend (APIs, SSLCommerz, SMS) |

## Tech Stack

- **Expo SDK 56** with Expo Router (file-based navigation)
- **React Native** + TypeScript
- **@medusajs/js-sdk** (same as web)
- **Zustand** for client state
- **expo-secure-store** for auth tokens
- **expo-web-browser** + deep links for SSLCommerz
- Cash on Delivery via Medusa system default

> Payments: backend registers **SSLCommerz** (cards, bKash, Nagad) + **Cash on Delivery** only — no Stripe. Because SSLCommerz uses an in-app browser, the whole app (including checkout) runs in **Expo Go** with no dev build required.
