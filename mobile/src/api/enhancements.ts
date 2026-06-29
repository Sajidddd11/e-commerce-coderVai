import { HttpTypes } from "@medusajs/types"
import { sdk } from "./sdk"
import { getAuthHeaders } from "@utils/storage"

/**
 * Custom backend endpoints the web storefront ships but doesn't fully use.
 * Each call fails gracefully (returns null / empty) so the UI can fall back.
 * See MOBILE_BUILD_GUIDE.md §15.
 */

export interface HeroSlide {
  id?: string
  image: string | any
  title?: string
  subtitle?: string
  link?: string
}

function mapWebLinkToMobile(webLink?: string): string | undefined {
  if (!webLink) return undefined
  
  if (webLink === "/store" || webLink === "/") {
    return "/(tabs)/shop"
  }
  
  const catMatch = webLink.match(/\/categories\/([^/]+)/)
  if (catMatch) {
    return `/(tabs)/shop?category=${catMatch[1]}`
  }

  const collMatch = webLink.match(/\/collections\/([^/]+)/)
  if (collMatch) {
    return `/(tabs)/shop?collection=${collMatch[1]}`
  }

  return webLink
}

function resolveImageSource(img: string | any): string | any {
  if (typeof img !== "string") return img
  if (img.startsWith("http://") || img.startsWith("https://") || img.startsWith("data:")) {
    return img
  }
  const storefrontUrl = process.env.EXPO_PUBLIC_STOREFRONT_URL || "https://zahan.com.bd"
  return `${storefrontUrl}${img.startsWith("/") ? "" : "/"}${img}`
}

export async function getHeroSlides(): Promise<HeroSlide[] | null> {
  return sdk.client
    .fetch<{ slides: any[] }>("/store/hero-slides", { method: "GET" })
    .then(({ slides }) => {
      if (!slides) return []
      return slides.map((s) => ({
        id: s.id,
        image: resolveImageSource(s.background_image || s.side_image),
        title: s.title || undefined,
        subtitle: s.description || undefined,
        link: mapWebLinkToMobile(s.button_link),
      }))
    })
    .catch(() => null)
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

export async function createProductReview(
  productId: string,
  body: { rating: number; title?: string; content?: string; customer_name?: string; customer_email?: string }
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
