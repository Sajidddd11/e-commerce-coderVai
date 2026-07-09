import { HttpTypes } from "@medusajs/types"
import { sdk } from "./sdk"
import { getAuthHeaders } from "@utils/storage"

/**
 * Custom backend endpoints the web storefront ships but doesn't fully use.
 * Each call fails gracefully (returns null / empty) so the UI can fall back.
 * See MOBILE_BUILD_GUIDE.md §15.
 */

/**
 * A single hero slide as returned by /store/app-hero-slides.
 * link_type + link_value drive in-app navigation directly — no URL-remapping heuristics.
 */
export interface HeroSlide {
  id?: string
  image: string | any
  title?: string
  subtitle?: string
  /** Resolved mobile route string, e.g. "/(tabs)/shop?category=t-shirts" */
  link?: string
}

/** link_type → Expo Router path builder */
function buildAppRoute(link_type: string, link_value?: string | null): string | undefined {
  switch (link_type) {
    case "shop":         return "/(tabs)/shop"
    case "new_arrivals": return "/(tabs)/shop"
    case "best_selling": return "/(tabs)/shop?sortBy=best_selling"
    case "recommended":  return "/(tabs)/shop?sortBy=recommended"
    case "category":     return link_value ? `/(tabs)/shop?category=${link_value}` : "/(tabs)/shop"
    case "collection":   return link_value ? `/(tabs)/shop?collection=${link_value}` : "/(tabs)/shop"
    case "product":      return link_value ? `/products/${link_value}` : undefined
    case "search":       return link_value ? `/(tabs)/shop?q=${encodeURIComponent(link_value)}` : "/(tabs)/shop"
    case "none":
    default:             return undefined
  }
}

export interface AppHeroSlidesResult {
  version: string
  slides: HeroSlide[]
}

/**
 * Fetches app hero slides from the dedicated mobile endpoint.
 * Pass `currentVersion` (the cached version string) to enable conditional GET:
 *   - Server returns `{ changed: false }` → returns null (use cached data)
 *   - Server returns `{ version, slides }` → returns parsed result
 */
export async function getAppHeroSlides(
  currentVersion?: string | null
): Promise<AppHeroSlidesResult | null> {
  const query: Record<string, string> = {}
  if (currentVersion) query.version = currentVersion

  return sdk.client
    .fetch<any>("/store/app-hero-slides", { method: "GET", query })
    .then((data) => {
      // Server confirmed nothing changed → caller keeps its cache
      if (data?.changed === false) return null

      const raw: any[] = data?.slides ?? []
      const slides: HeroSlide[] = raw.map((s) => ({
        id: s.id,
        image: s.image,
        title: s.title ?? undefined,
        subtitle: s.subtitle ?? undefined,
        link: buildAppRoute(s.link_type, s.link_value),
      }))
      return { version: data.version ?? new Date(0).toISOString(), slides }
    })
    .catch(() => null)
}

// Legacy alias — kept so HeroCarousel and any other existing consumer compiles
export async function getHeroSlides(): Promise<HeroSlide[] | null> {
  const result = await getAppHeroSlides()
  return result?.slides ?? null
}

export async function getBestSelling(
  regionId: string,
  limit = 10
): Promise<HttpTypes.StoreProduct[]> {
  return sdk.client
    .fetch<{ products: HttpTypes.StoreProduct[] }>("/store/best-selling", {
      method: "GET",
      query: { region_id: regionId, limit },
    })
    .then(({ products }) => products ?? [])
    .catch(() => [])
}

export interface ProductSuggestion {
  id: string
  title: string
  handle: string
  thumbnail: string | null
  category?: string
  collection?: string
}

export interface CategorySuggestion {
  id: string
  name: string
  handle: string
  type: "category"
}

export interface CollectionSuggestion {
  id: string
  title: string
  handle: string
  type: "collection"
}

export interface SearchSuggestionsResult {
  products: ProductSuggestion[]
  categories: CategorySuggestion[]
  collections: CollectionSuggestion[]
  popular: string[]
}

const EMPTY_SUGGESTIONS: SearchSuggestionsResult = {
  products: [],
  categories: [],
  collections: [],
  popular: [],
}

export async function getSearchSuggestions(
  q: string
): Promise<SearchSuggestionsResult> {
  const term = q.trim()
  if (term.length < 2) return EMPTY_SUGGESTIONS

  return sdk.client
    .fetch<SearchSuggestionsResult>("/store/search-suggestions", {
      method: "GET",
      query: { q: term },
    })
    .then((data) => ({
      products: data.products ?? [],
      categories: data.categories ?? [],
      collections: data.collections ?? [],
      popular: data.popular ?? [],
    }))
    .catch(() => EMPTY_SUGGESTIONS)
}

export interface FreeShippingInfo {
  threshold: number
  currency_code?: string
  enabled?: boolean
}

export async function getFreeShippingThreshold(): Promise<FreeShippingInfo | null> {
  return sdk.client
    .fetch<FreeShippingInfo>("/store/free-shipping-threshold", { method: "GET" })
    .then((data) => data ?? null)
    .catch(() => null)
}

export interface ProductReview {
  id: string
  rating: number
  title?: string
  content?: string
  customer_name?: string
  created_at?: string
  helpful_count?: number
}

export async function getProductReviews(
  productId: string
): Promise<{ reviews: ProductReview[]; average: number; count: number }> {
  return sdk.client
    .fetch<any>(
      `/store/reviews/product/${productId}`,
      { method: "GET" }
    )
    .then((data) => {
      const reviews: ProductReview[] = data.reviews ?? []
      const count = data.count ?? reviews.length ?? 0
      
      let average = data.average_rating ?? data.average ?? 0
      
      // If average wasn't provided but we have reviews, compute it manually
      if (!average && reviews.length > 0) {
        const sum = reviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0)
        average = sum / reviews.length
      }

      return {
        reviews,
        average,
        count,
      }
    })
    .catch(() => ({ reviews: [], average: 0, count: 0 }))
}

export interface ReviewEligibility {
  eligible: boolean
  order_id?: string
  order_display_id?: number
}

/**
 * Check if the authenticated customer can review a product.
 * Returns eligible=true only when they have a delivered or refunded order
 * containing that product.
 */
export async function checkReviewEligibility(
  productId: string
): Promise<ReviewEligibility> {
  try {
    const headers = await getAuthHeaders()
    const data = await sdk.client.fetch<ReviewEligibility>(
      `/store/reviews/product/${productId}/eligibility`,
      { method: "GET", headers }
    )
    return data ?? { eligible: false }
  } catch {
    return { eligible: false }
  }
}

export async function createProductReview(
  productId: string,
  body: {
    rating: number
    title?: string
    content?: string
    customer_name?: string
    customer_email?: string
    order_id: string  // now required — must be a delivered/refunded order
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const headers = await getAuthHeaders()
    await sdk.client.fetch(`/store/reviews/product/${productId}`, {
      method: "POST",
      headers,
      body,
    })
    return { success: true }
  } catch (e: any) {
    return { success: false, error: e?.message ?? "Could not submit review" }
  }
}

export async function markReviewHelpful(reviewId: string): Promise<void> {
  await sdk.client
    .fetch(`/store/reviews/${reviewId}/helpful`, { method: "POST" })
    .catch(() => {})
}
