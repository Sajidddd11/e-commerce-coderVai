# Web → Mobile Mapping

Quick reference when porting screens. Full specs in [MOBILE_BUILD_GUIDE.md](../MOBILE_BUILD_GUIDE.md).

## Routes

| Web route | Mobile route |
|-----------|--------------|
| `/{cc}/` | `/(tabs)/` |
| `/{cc}/store` | `/(tabs)/shop` |
| `/{cc}/products/[handle]` | `/product/[handle]` |
| `/{cc}/categories/[...category]` | `/category/[...handle]` |
| `/{cc}/collections/[handle]` | `/collection/[handle]` |
| `/{cc}/cart` | `/(tabs)/cart` |
| `/{cc}/checkout` | `/checkout` → `/checkout/review` |
| `/{cc}/checkout/sslcommerz-callback` | `/payment/sslcommerz-callback` |
| `/{cc}/order/[id]/confirmed` | `/order/[id]/confirmed` |
| `/{cc}/account` (logged in) | `/(tabs)/account` |
| `/{cc}/account` (logged out) | `/account/login` |
| `/{cc}/account/profile` | `/account/profile` |
| `/{cc}/account/orders` | `/account/orders` |
| `/{cc}/account/addresses` | `/account/addresses` |
| `/{cc}/about` | `/static/about` |
| `/{cc}/contact` | `/static/contact` |

## Data layer

| Web (`src/lib/data/`) | Mobile (`src/api/`) |
|-----------------------|---------------------|
| `cart.ts` | `cart.ts` |
| `customer.ts` | `customer.ts` |
| `products.ts` | `products.ts` |
| `checkout.ts` | `checkout.ts` |
| `sslcommerz.ts` | `sslcommerz.ts` |
| `orders.ts` | `orders.ts` |
| `regions.ts` | `regions.ts` |
| `categories.ts` | `categories.ts` |
| `collections.ts` | `collections.ts` |
| `payment.ts` | `payment.ts` |
| `fulfillment.ts` | `fulfillment.ts` |
| `password-reset.ts` | `password-reset.ts` |

## Components

| Web module | Mobile component |
|------------|------------------|
| `product-preview` | `ProductCard` |
| `product-actions` | `VariantSelector` + `AddToCartBar` |
| `image-gallery` | `ImageGallery` |
| `consolidated-checkout-form` | `CheckoutForm` |
| `payment-button` | `PaymentButton` |
| `district-select` | `DistrictPicker` |
| `central-search` | `SearchBar` |
| `home-hero` | `HeroCarousel` |
| `category-showcase` | `CategoryShowcase` |
| `trust-section` | `TrustSection` |
| `whatsapp-chat-button` | `WhatsAppFAB` |
| `nav` | `Header` + tab bar |
| `footer` | `FooterLinks` (in account/static) |

## Storage

| Web | Mobile |
|-----|--------|
| `_medusa_jwt` cookie | `SecureStore` key `medusa_jwt` |
| `_medusa_cart_id` cookie | `AsyncStorage` key `medusa_cart_id` |
| `localStorage.checkout_form_state` | `AsyncStorage` key `checkout_form_state` |
| `localStorage._medusa_cart_id_ssl` | `AsyncStorage` key `medusa_cart_id_ssl` |

## Styling

| Web | Mobile |
|-----|--------|
| `tailwind.config.js` grey palette | `design/theme.ts` → `colors.grey` |
| `globals.css` typography classes | `design/typography.ts` → `textStyles` |
| `className="bg-[#56aebf]"` | `colors.brand.teal` |
| `className="bg-slate-900"` | `colors.slate[900]` |
| Tailwind `shadow-md` | `shadows.md` from theme |
