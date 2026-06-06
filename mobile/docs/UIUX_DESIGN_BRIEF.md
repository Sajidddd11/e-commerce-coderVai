# ZAHAN Mobile App — UI/UX Design Brief for AI Designer

Use this document as your **complete design prompt**. Redesign the ZAHAN Fashion & Lifestyle mobile shopping app (React Native / Expo). All screens, components, and flows are listed below. Produce **production-ready mobile UI** that feels premium, native, and conversion-focused — not a shrunken website.

---

## 1. Project context

| Field | Value |
|-------|-------|
| **Brand** | ZAHAN — Fashion & Lifestyle |
| **Market** | Bangladesh (primary), BDT currency |
| **Platform** | iOS + Android native app (Expo SDK 56, React Native) |
| **Backend** | Medusa v2 e-commerce API (live: `api.zahan.net`) |
| **Web reference** | `demo-clothing-store-storefront` (Next.js) — brand alignment, not 1:1 copy |
| **App status** | Feature-complete MVP; needs visual polish and UX refinement |
| **Target devices** | iPhone SE → Pro Max, Android phones (360–430pt width) |

### Brand personality
- Modern, clean, trustworthy fashion retailer
- Primary accent: **teal** `#56AEBF` — CTAs, active states, links
- Commerce neutrals: slate greys, white surfaces
- Sale/discount: red `#EF4444`
- Premium but accessible — not luxury-minimal, not marketplace-noisy

### Critical mobile rules (do NOT break)
1. **No website footer** on shopping screens — help/legal/trust content lives on **Account** tab only
2. **No floating WhatsApp FAB** — WhatsApp is a row inside Account → Help & support
3. **Light theme only** — app forces light UI even when phone is in dark mode; status bar = dark icons on white
4. **Bottom tab bar always visible** on main tabs (Home, Shop, Cart, Account)
5. **Thumb-zone CTAs** — primary actions bottom-aligned on PDP, cart, checkout
6. **Bangladesh-specific** — district picker for shipping, COD + SSLCommerz (bKash/Nagad/card), phone number fields

---

## 2. Design system (current tokens — refine, don't replace arbitrarily)

### Colors
```
Brand teal:        #56AEBF (primary CTA, active tab, focus rings)
Teal hover:        #458F9E
Teal muted bg:     rgba(86,174,191,0.1)

Grey scale:        0=#FFF, 10=#F3F4F6, 20=#E5E7EB, 40=#9CA3AF, 50=#6B7280, 90=#111827
Slate commerce:    900=#0F172A (primary buttons, selected category chips)

Semantic:          success #22C55E, error/sale #EF4444, warning #F59E0B
WhatsApp green:    #25D366 (Account support row only)
Dark marketing:    #000000 (About/Offers hero sections on web — optional on static pages)
```

### Typography
```
Fonts:  Montserrat (brand, headings) + Inter (body, UI)
        Optional: SolaimanLipi for Bangla copy

Scale:  xs 10 | sm 12 | base 14 | md 16 | lg 18 | xl 20 | 2xl 24 | 3xl 30 | 4xl 36

Roles:  brand/logo — Montserrat Bold 18
        sectionHeading — Montserrat SemiBold 24
        subheading — Montserrat Medium 16
        body — Inter Regular 14
        bodySmall — Inter Regular 12
        button — Inter SemiBold 14
        product price (cards) — Inter SemiBold 14 bold
        product price (PDP) — Montserrat Bold 20
```

### Spacing (4pt grid)
`4 | 8 | 12 | 16 | 20 | 24 | 32 | 40 | 48`

### Radius
`4 | 8 | 16 | 20 | pill 9999`

### Shadows
Subtle elevation on cards (sm/md). Avoid heavy shadows everywhere.

### Icons
Lucide React Native (line icons). Tab bar: Home, ShoppingBag, ShoppingCart, User.

---

## 3. Information architecture

```
App
├── Tab: Home
├── Tab: Shop (catalog + search + filters)
├── Tab: Cart
├── Tab: Account
├── Stack: Search (modal, from header)
├── Stack: Product Detail /product/[handle]
├── Stack: Category /category/[handle]
├── Stack: Checkout /checkout → /checkout/review
├── Stack: Order confirmed /order/[id]/confirmed
├── Stack: Payment callback /payment/sslcommerz-callback
├── Stack: Account sub-screens (orders, profile, addresses, forgot-password)
├── Stack: Order detail /account/orders/[id]
├── Stack: Order transfer /order/[id]/transfer/[token]
└── Stack: Static pages (about, contact, offers, shipping, returns, privacy, terms)
```

---

## 4. Global components (design each with all states)

### 4.1 Screen wrapper (`Screen`)
- Safe area top only (tabs handle bottom)
- Background: white `#FFFFFF`
- Full-bleed scroll content

### 4.2 Header (`Header`) — Home only
**Elements:**
- Left: **ZAHAN** wordmark (Montserrat Bold, letter-spacing)
- Right: **Search field** (fake input) — white, 2px border `#E5E7EB`, placeholder "Search products...", search icon button right
- Tap → opens full Search screen
- Bottom border 1px `#E5E7EB`

**States:** default, pressed

### 4.3 Announcement bar (`AnnouncementBar`)
- Thin promo strip below header on Home
- Example: "Use code WELCOME20 for 20% off your first order!"
- Dark navy or teal-muted background, white/small text, horizontally scrollable if long

### 4.4 Bottom tab bar
**4 tabs:** Home | Shop | Cart | Account
- Height ~56pt + safe area
- Active: teal icon + label
- Inactive: grey `#6B7280`
- Cart badge: red circle, white count (when items > 0)
- White background, top border `#E5E7EB`
- No labels truncation

### 4.5 Buttons (`Button`)
**Variants:** primary (slate-900), secondary (white bordered), brand (teal), danger (red), ghost
**Sizes:** small | base | large
**States:** default, pressed (scale 0.98), disabled, loading (spinner)
**Options:** fullWidth, leftIcon

### 4.6 Inputs (`Input`)
- Label above field
- Bordered rounded field, focus teal border
- Error state: red border + error message below
- Types: text, email, phone, password (secure), multiline

### 4.7 Badges (`Badge`)
**Variants:** sale (red), discount (slate-900), new (teal), neutral (grey)
- Used on product cards: "X% off", "New"
- Small, top-left on product image

### 4.8 Cards (`Card`)
- White surface, rounded 8px, optional border
- Used for account menu rows, support sections

### 4.9 Skeleton loaders (`Skeleton`)
- Shimmer placeholders for product grid, PDP, rails
- Match masonry card proportions

### 4.10 ThemedText
All text uses typed variants (see typography). Never raw font sizes in screens.

---

## 5. Product components (high priority — needs polish)

### 5.1 Product card (`ProductCard`)
**Used in:** Shop masonry grid, Category page, Home horizontal rails

**Layout — Masonry grid (Shop):**
- 2 columns, **Pinterest/masonry** staggered heights
- Image aspect ratios cycle: 4:5, 1:1, 3:4, 5:6 per card index
- Column gap: **8px**, outer padding **8px** (tight — user complained about too much gap)
- Card: white bg, rounded 8px, light shadow

**Image area:**
- Cover fit, grey placeholder `#F3F4F6`
- **Sale badge** top-left: red `"X% off"`
- **New badge** top-left (teal) if created < 30 days and not on sale
- **Original price chip** bottom-right on image: dark slate bg, white strikethrough price (when on sale)
- **Out of stock overlay:** dark 55% opacity, white "Out of stock" centered

**Footer** (grey-10 bg `#F3F4F6`):
- Product type: 12px uppercase grey (optional)
- Title: 14px Inter, **2 lines max**, left-aligned, `#111827`
- Price row: **bold** sale price (red if discounted, else dark) + strikethrough original

**Rail variant (Home):**
- Fixed width ~160px, **square** 1:1 image
- Same footer/badge rules

**States:** default, pressed (scale 0.98)

### 5.2 Product grid (`ProductGrid`)
- Masonry 2-column ScrollView
- Infinite scroll (load more at bottom)
- Pull-to-refresh
- Empty state: centred grey message
- Loading: 2-column skeleton with varying heights

### 5.3 Product rail (`ProductRail`)
- Horizontal scroll, 160px cards, 8px gap
- Section on Home: New Arrivals, Best Selling, Featured Collections

### 5.4 Product price (`ProductPrice`)
- **Compact** (cards): bold 14px + strikethrough original
- **Full** (PDP): large 20px Montserrat + strike + % off

### 5.5 Product reviews (`ProductReviews`)
- Star rating summary + list of reviews
- On PDP below description
- States: loading, empty, populated

---

## 6. Search components

### 6.1 Product search bar (`ProductSearchBar`)
- White field, **2px border**, rounded 8px
- Focus: teal border
- Right: search submit icon button
- Clear (×) when text present
- Placeholder: "Search products..."

### 6.2 Search suggestions panel (`SearchSuggestionsPanel`)
**Dropdown** (Shop) or **full-page** (Search screen)

**Sections when typing (2+ chars):**
1. **Products** — 40px thumb, title, category subtitle, chevron
2. **Categories** — folder icon, name
3. **Collections** — layers icon, title
4. **Popular** — trending icon, search term
5. **Footer CTA** — teal-muted bar "See all results for '{query}'"

**States:** hint text (empty), loading spinner, no results, populated
**Debounce:** 300ms

### 6.3 Search screen (`/search`)
- Modal slide-up animation
- Back chevron + "Search" title
- Auto-focus keyboard
- Full suggestions list below bar

---

## 7. Home tab (`/(tabs)/index`)

**Scroll structure top → bottom:**

| # | Section | Component | Design notes |
|---|---------|-----------|--------------|
| 1 | Header | Header | Logo + search pill |
| 2 | Promo | AnnouncementBar | Thin full-width strip |
| 3 | Hero | HeroCarousel OR HeroBanner | Carousel if API images exist; else navy card with ZAHAN, "Fashion & Lifestyle", teal CTA "Shop the collection" |
| 4 | Categories | CategoryTiles | Horizontal scroll, 80px circles with image + label below |
| 5 | New Arrivals | SectionHeader + ProductRail | "New Arrivals" + "See all →" |
| 6 | Best Selling | SectionHeader + ProductRail | Conditional |
| 7 | Featured Collections | SectionHeader + ProductRail × N | One rail per collection |

**Section header:** Title left (24px semibold), "See all" link right (teal + chevron)

**Hero carousel:** Full-width, rounded 16px, autoplay 5s, dots indicator, optional title/subtitle overlay

**Do NOT include on Home:** footer, trust section, community CTA, WhatsApp FAB (moved to Account)

**States:** loading skeletons, pull-to-refresh, empty categories hidden

---

## 8. Shop tab (`/(tabs)/shop`)

**Fixed top (does not scroll with products):**

| Block | Elements |
|-------|----------|
| Search row | ProductSearchBar + dropdown suggestions |
| Results header | Only when searching: `Results for "{query}"` + subtitle |
| Category chips | Horizontal scroll: All, Sneakers, Bags, etc. — **compact pills** (8px vertical padding, NOT tall boxes) |
| Sort chips | Latest | Price ↑ | Price ↓ — outlined pills, active = teal border + teal-muted fill |

**Scrollable:** Masonry product grid

**States:** loading, empty search, infinite load more

**Known UX fix applied:** category row must NOT stretch vertically (no flexGrow on ScrollView)

---

## 9. Product detail page (`/product/[handle]`)

**Layout top → bottom:**

| # | Element | Notes |
|---|---------|-------|
| 1 | Back button | Chevron left, top-left over image or in bar |
| 2 | Image gallery | Full-width swipeable images, square or 4:5 |
| 3 | Title | Product name, 24px semibold |
| 4 | Price | ProductPrice large variant |
| 5 | Description | Body text, markdown-capable |
| 6 | Variant selectors | Option chips (size, color, etc.) — selected = slate-900 fill |
| 7 | Add to cart | Full-width primary/brand button, sticky bottom optional |
| 8 | Reviews | ProductReviews section |
| 9 | Related products | SectionHeader + ProductRail |

**Add to cart flow:** Alert with "Keep shopping" / "View cart"
**States:** loading skeleton, out of stock (disabled CTA), variant required error

---

## 10. Category page (`/category/[handle]`)

- Back + category title header
- Masonry ProductGrid (no search/filters — keep simple)
- Empty: "No products in this category yet."

---

## 11. Cart tab (`/(tabs)/cart`)

### Empty state
- "Your cart is empty" heading
- Subtitle + "Browse Products" button → Shop

### Filled state
| # | Element |
|---|---------|
| 1 | "Shopping Cart" heading |
| 2 | Free shipping nudge | Teal-muted bar: "Add ৳X more for free shipping!" or "You've unlocked free shipping!" |
| 3 | Line items | Thumb 80px, title, variant, qty stepper (−/+), remove, line price |
| 4 | Promo code | Input + Apply, applied chips with × remove |
| 5 | Summary | Subtotal, shipping, discount, **total** |
| 6 | Checkout CTA | Full-width primary button → /checkout |

**States:** loading, mutating (disabled steppers), promo error

---

## 12. Checkout flow

### 12.1 Checkout form (`/checkout`)
**Multi-section form (scroll):**

| Section | Fields |
|---------|--------|
| Contact | Email (prefill if logged in) |
| Shipping | First name, last name, address, **District** (searchable picker), phone |
| Delivery type | Inside Dhaka / Outside Dhaka chips |
| Shipping method | Radio cards with price + ETA |
| Payment method | COD, SSLCommerz (bKash, Nagad, card icons via PaymentIcon) |

**CTA:** "Review order" → /checkout/review
**States:** loading methods, validation errors, preparing checkout spinner

### 12.2 District picker (`DistrictPicker`)
- Modal/bottom sheet
- Search field filters Bangladesh districts list
- Tap to select

### 12.3 Review (`/checkout/review`)
- Order summary (items, address, shipping, payment)
- COD: "Place order" button
- SSLCommerz: opens in-app browser, returns via deep link

### 12.4 Order confirmed (`/order/[id]/confirmed`)
- Success illustration/icon
- Order ID, thank you message
- "Continue shopping" + "View order" buttons

### 12.5 SSLCommerz callback (`/payment/sslcommerz-callback`)
- Loading / success / failure states

---

## 13. Account tab (`/(tabs)/account`)

### Logged out
- Welcome / Create account toggle
- Form: first name, last name, phone (register), email, password
- Forgot password link
- Sign in / Create account button
- Toggle register/login link
- **AccountSupportSection** below form

### Logged in
| # | Element |
|---|---------|
| 1 | Profile header | "Hello, {firstName}" + email |
| 2 | Menu card | Orders, Addresses, Profile — icon + label + chevron rows |
| 3 | Log out | Secondary button |
| 4 | AccountSupportSection | See below |

### 13.1 Account support section (`AccountSupportSection`)
**Native settings-style — NOT a web footer**

| Section | Content |
|---------|---------|
| Why shop with us | 6 trust tiles in 3×2 grid: Fast Delivery, Secure Payment, Easy Returns, 24/7 Support, Quality First, Quick Dispatch |
| Join the community | Dark card, Facebook CTA "Follow on Facebook" |
| Help & support | WhatsApp row (green icon), Contact, Shipping, Returns |
| About | About ZAHAN, Offers & promotions |
| Legal | Privacy policy, Terms of service |
| Social | Facebook, Instagram, YouTube icon buttons |
| Copyright | © 2026 ZAHAN Fashion and Lifestyle |

### Account sub-screens
- **Orders list** — order cards with date, status, total
- **Order detail** — line items, address, payment, status timeline
- **Profile** — edit name, email, phone
- **Addresses** — list + add/edit/delete
- **Forgot password** — email → OTP flow

---

## 14. Static pages (`/static/*`)
Rendered via `StaticScreen` — markdown content with back navigation.

| Page | Purpose |
|------|---------|
| about | Brand story |
| contact | Email, phone, WhatsApp |
| offers | Promotions |
| shipping-info | Delivery times, zones |
| returns | Return policy |
| privacy-policy | Legal |
| terms-of-service | Legal |

**Design:** Clean readable article layout, 16px body, generous line height, H2 section headings.

---

## 15. Home marketing components (Account + optional Home)

### TrustSection
6 feature cards with teal icon pill + title + subtitle

### CTASection
Dark `#000` card, white heading "Join the ZAHAN community", Facebook button

### HeroBanner (fallback)
Navy `#0F172A` rounded card, white text, teal CTA

### HeroCarousel
API-driven slides, image + optional title/subtitle/link

### CategoryTiles
80px circle image, label below, horizontal scroll

---

## 16. Key user flows (design end-to-end)

```
Browse → PDP → Add to cart → Cart → Checkout → Review → Pay → Confirmed
Search → Suggestion tap → PDP OR See all → Shop results
Home → Category tile → Category page → PDP
Account → Orders → Order detail
Guest → Register at checkout or Account tab
Forgot password → OTP → Reset
SSLCommerz → External browser → Deep link callback → Confirmed
```

---

## 17. Known pain points (fix in redesign)

| Issue | Current state | Design direction |
|-------|---------------|------------------|
| Product card gaps | Recently tightened to 8px | Validate feels Pinterest-dense, not airy |
| Category chips | Were too tall | Keep compact pills, 32–36px height max |
| Search | Now functional with API | Polish dropdown hierarchy, keyboard overlap |
| Home header search | Fake input → modal | Consider inline expand or keep modal |
| PDP | Functional but basic | Gallery dots, sticky ATC bar, trust microcopy |
| Checkout | Long form | Step indicator or collapsible sections |
| Account support | Long scroll | Consider accordion sections |
| Empty states | Text only | Add illustration/icon per screen |
| Loading | Grey skeletons | Brand-aligned shimmer |
| Typography | Mixed sizes | Strict 14px body on cards, clear hierarchy |
| Bangla | Not fully supported | Reserve space for SolaimanLipi if bilingual |

---

## 18. Assets needed from designer

1. **App icon** + splash screen (white bg, ZAHAN logo)
2. **Logo** — wordmark SVG (black + white versions)
3. **Hero banners** — 3–5 slides 16:9 or 4:5
4. **Empty state illustrations** — cart, search, orders, network error
5. **Payment icons** — bKash, Nagad, SSLCommerz, COD
6. **Category fallback images** — when category has no product thumb
7. **Social icons** — FB, IG, YouTube (or confirm Lucide is fine)
8. **Optional:** custom tab bar icons (filled vs outline active state)

---

## 19. Deliverables expected from AI UI/UX designer

Provide **all** of the following:

### A. Design system page
- Color palette with usage rules
- Type scale with examples
- Spacing, radius, elevation
- Icon style guide
- Motion principles (spring, 300ms transitions)

### B. Component library (Figma-style frames)
Every component in §4–§6 with variants and states

### C. Screen designs (iPhone 15 Pro 393×852 + Android 360×800)
All 26 routes listed in §3 — **both** empty/loading and populated states

### D. Interactive notes
- Tap targets min 44×44pt
- Scroll behaviors (what sticks, what scrolls)
- Keyboard handling on forms/search
- Safe areas

### E. Developer handoff
- Export specs: padding, font, color hex per element
- Redlines for masonry grid (column width formula, gaps)
- Annotation for which elements map to existing component names

---

## 20. Master prompt (copy-paste for AI designer)

```
You are a senior mobile UI/UX designer specializing in fashion e-commerce apps.

Redesign the ZAHAN mobile shopping app (React Native/Expo, Bangladesh market, BDT currency).

BRAND: ZAHAN Fashion & Lifestyle. Primary color teal #56AEBF. Clean, modern, trustworthy. Fonts: Montserrat (headings) + Inter (body).

PLATFORM: Native iOS/Android app with bottom tabs (Home, Shop, Cart, Account). Light theme only. No web footer on shop screens. No floating WhatsApp button.

LAYOUT PRIORITIES:
- Shop: Pinterest masonry 2-column product grid, 8px gaps, staggered image heights
- Product cards: sale/new badges on image, bold price, 2-line title, out-of-stock overlay
- Search: bordered bar, grouped autocomplete (products/categories/collections/popular)
- Home: hero carousel, category circles, horizontal product rails
- Account: profile menu + native Help/Support sections (trust, WhatsApp, legal)
- Checkout: Bangladesh districts, COD + SSLCommerz, multi-section form
- Cart: free-shipping progress, promo codes, qty steppers

DESIGN ALL SCREENS: Home, Shop, Search modal, Product Detail, Category, Cart (empty+filled), Checkout, Review, Order Confirmed, Account (guest+logged in), Orders, Profile, Addresses, 7 static pages.

DELIVER: Complete design system + component library + all screen states + spacing specs for developers. Match premium fashion apps (Zara, ASOS, Shop app) for density and clarity, not generic template stores.

Reference brand web: fashion lifestyle, teal accents, slate-900 primary buttons, red sale badges.

Do not design: desktop layouts, web footer on every page, dark mode theme, floating chat FAB.
```

---

## 21. File map for developers (component → path)

| Designer label | Code path |
|----------------|-----------|
| Home screen | `app/(tabs)/index.tsx` |
| Shop screen | `app/(tabs)/shop.tsx` |
| Cart screen | `app/(tabs)/cart.tsx` |
| Account screen | `app/(tabs)/account.tsx` |
| Search screen | `app/search.tsx` |
| Product PDP | `app/product/[handle].tsx` |
| Category | `app/category/[handle].tsx` |
| Checkout | `app/checkout/index.tsx`, `review.tsx` |
| Header | `src/components/layout/Header.tsx` |
| Product card | `src/components/product/ProductCard.tsx` |
| Product grid | `src/components/product/ProductGrid.tsx` |
| Search bar | `src/components/search/ProductSearchBar.tsx` |
| Account support | `src/components/layout/AccountSupportSection.tsx` |
| Design tokens | `design/theme.ts`, `design/typography.ts` |

---

*Document version: June 2026 — reflects app state after masonry cards, search upgrade, Account support relocation, status bar fix.*
