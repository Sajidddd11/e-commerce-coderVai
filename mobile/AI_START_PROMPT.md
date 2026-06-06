# AI Start Prompt — ZAHAN Mobile App

Copy everything inside the block below and paste it as your first message to an AI coding agent.

---

```
You are building the ZAHAN e-commerce mobile app in React Native (Expo).

## Context
- Repo: e-commerce-coderVai
- Mobile folder: /mobile/
- Web storefront to mirror: /demo-clothing-store-storefront/ (Next.js + Medusa v2)
- Backend: /demo-clothing-store/ (Medusa v2, SSLCommerz, SMS OTP)
- Master spec: Read /mobile/MOBILE_BUILD_GUIDE.md IN FULL before writing any code
- Design tokens: /mobile/design/theme.ts, typography.ts, constants.ts — NEVER hardcode colors

## Rules
1. Native app only — NO WebView wrappers (no Capacitor/Cordova)
2. Use Expo SDK 56, Expo Router, TypeScript (React 19, RN 0.85, Reanimated 4)
3. Use @medusajs/js-sdk (same as web) — port logic from demo-clothing-store-storefront/src/lib/data/
4. Replace web cookies with expo-secure-store (JWT) + AsyncStorage (cart ID)
5. Import all colors/fonts from mobile/design/ — match ZAHAN brand (#56AEBF teal, slate-900 commerce CTAs)
6. Feature parity with web — see checklist in MOBILE_BUILD_GUIDE.md §6
7. Follow phase plan in MOBILE_BUILD_GUIDE.md §18 — ask which phase to start if unclear

## Current task
[REPLACE THIS LINE — e.g. "Phase 0: Scaffold Expo project and wire design tokens"]

## Before coding
1. Read MOBILE_BUILD_GUIDE.md
2. Read the corresponding web files listed in Appendix A for the current screen
3. Confirm design tokens from mobile/design/

## Output expectations
- TypeScript with strict types
- Components use StyleSheet + design tokens (not inline hex)
- Error handling with user-facing toasts
- Loading skeletons on data fetches
- Match web business logic exactly (especially Bangladesh checkout in §13)
```

---

## Suggested phase prompts

### Phase 0 — Scaffold
```
Current task: Phase 0 — Initialize Expo app in /mobile/, install dependencies from MOBILE_BUILD_GUIDE.md §3, create src/api/sdk.ts, storage utils, root layout with font loading, and tab navigator skeleton. Do not build screens yet.
```

### Phase 1 — Catalog
```
Current task: Phase 1 — Build UI component library (Button, Input, Card, Badge, Skeleton, ProductCard), region/cart stores, Shop tab with FlashList grid, and Product detail screen. Reference web files in Appendix A.
```

### Phase 2 — Cart & Checkout
```
Current task: Phase 2 — Build Cart tab (line items, promo code, summary) and Checkout flow (consolidated form + review screen) with COD payment. Port prepareCheckout and placeOrder from web lib/data/.
```

### Phase 3 — Payments
```
Current task: Phase 3 — Integrate SSLCommerz (expo-web-browser + deep link callback) including bKash/Nagad virtual providers, plus Cash on Delivery. There is NO Stripe (backend doesn't use it). Follow MOBILE_BUILD_GUIDE.md §12 exactly.
```

### Phase 4 — Account
```
Current task: Phase 4 — Build login, register, profile, addresses, orders, password reset OTP, and order transfer screens. Port customer.ts and password-reset.ts from web.
```

### Phase 5 — Home & Static
```
Current task: Phase 5 — Build Home screen (hero, categories, featured, trust, CTA), WhatsApp FAB, and all static info pages. Match web home components and marketing aesthetic for About/Offers.
```

### Phase 6 — Enhancements
```
Current task: Phase 6 — Add product reviews, search suggestions, best-selling section, free shipping nudge, and Facebook analytics events. Use backend APIs listed in MOBILE_BUILD_GUIDE.md §15.
```
