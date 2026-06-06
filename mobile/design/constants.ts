/**
 * Business constants ported from demo-clothing-store-storefront/src/lib/constants.tsx
 * and checkout-specific logic.
 */

/** Bangladesh districts — from district-select/index.tsx */
export const BANGLADESH_DISTRICTS = [
  "Dhaka", "Savar", "Nabinagar", "Ashulia", "Keraniganj", "Tongi",
  "Bagerhat", "Bandarban", "Barguna", "Barisal", "Bhola", "Bogra",
  "Brahmanbaria", "Chandpur", "Chapainawabganj", "Chittagong", "Chuadanga",
  "Comilla", "Coxs Bazar", "Dinajpur", "Faridpur", "Feni", "Gaibandha",
  "Gazipur", "Gopalganj", "Habiganj", "Jamalpur", "Jessore", "Jhalokathi",
  "Jhenaidah", "Joypurhat", "Khagrachari", "Khulna", "Kishoreganj",
  "Kurigram", "Kushtia", "Lakshmipur", "Lalmonirhat", "Madaripur",
  "Magura", "Manikganj", "Meherpur", "Moulvibazar", "Munshiganj",
  "Mymensingh", "Naogaon", "Narail", "Narayanganj", "Narsingdi",
  "Natore", "Netrokona", "Nilphamari", "Noakhali", "Pabna",
  "Panchagarh", "Patuakhali", "Pirojpur", "Rajbari", "Rajshahi",
  "Rangamati", "Rangpur", "Satkhria", "Shariatpur", "Sherpur",
  "Sirajganj", "Sunamganj", "Sylhet", "Tangail", "Thakurgaon",
] as const

/** Dhaka metro districts — used for shipping cost logic */
export const DHAKA_METRO_DISTRICTS = [
  "Dhaka", "Savar", "Nabinagar", "Ashulia", "Keraniganj", "Tongi",
  "Gazipur", "Narayanganj", "Narsingdi", "Manikganj",
] as const

/** Shipping cost overrides (BDT) — matches consolidated-checkout-form */
export const SHIPPING_COSTS = {
  dhakaMetro: 80,
  outsideDhaka: 130,
  pickup: 0,
} as const

export const socialMediaLinks = {
  facebook: "https://www.facebook.com/zahan.com.bd",
  instagram: "https://www.instagram.com/zahan.com.bd",
  youtube: "https://youtube.com/@zahanbd",
  tiktok: "https://www.tiktok.com/@zahantrade",
} as const

export const WHATSAPP_NUMBER = "8801304117711"
export const WHATSAPP_DEFAULT_MESSAGE = "Hello, I need support"

/**
 * Active payment providers (backend medusa-config.ts registers only SSLCommerz
 * + Medusa's built-in system default for Cash on Delivery). bKash/Nagad are
 * virtual UI options that route through SSLCommerz via `selected_gateway`.
 */
export const paymentInfoMap: Record<string, { title: string; iconKey: string }> = {
  pp_system_default: { title: "Cash on Delivery", iconKey: "cod" },
  pp_sslcommerz_default: { title: "Card / Mobile Banking (SSLCommerz)", iconKey: "sslcommerz" },
  pp_sslcommerz_default_bkash: { title: "bKash", iconKey: "bkash" },
  pp_sslcommerz_default_nagad: { title: "Nagad", iconKey: "nagad" },
}

export const isManual = (providerId?: string) =>
  providerId?.startsWith("pp_system_default")

export const isSslCommerz = (providerId?: string) =>
  providerId?.startsWith("pp_sslcommerz_")

/** Currencies that don't divide by 100 — from web constants */
export const noDivisionCurrencies = [
  "krw", "jpy", "vnd", "clp", "pyg", "xaf", "xof", "bif", "djf",
  "gnf", "kmf", "mga", "rwf", "xpf", "htg", "vuv", "xag", "xdr", "xau",
] as const

/** Hero carousel slides — from home-hero/index.tsx */
export const HERO_SLIDES = [
  { image: "banners/all.png", alt: "Shop All Categories", link: "/store" },
  { image: "banners/headphone.jpg", alt: "Headphones Collection", link: "/categories/headphones" },
  { image: "banners/snicker.jpg", alt: "Sneakers Collection", link: "/categories/sneakers" },
  { image: "banners/watch.jpg", alt: "Watches Collection", link: "/categories/watches" },
] as const

/** Announcement bar promo — from announcement component */
export const ANNOUNCEMENT = {
  message: "Use code WELCOME20 for 20% off your first order!",
  code: "WELCOME20",
} as const

/** Facebook Pixel ID — from web layout */
export const FACEBOOK_PIXEL_ID = "868788322534380"
