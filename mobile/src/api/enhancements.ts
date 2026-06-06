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
  image: string
  title?: string
  subtitle?: string
  link?: string
}

export async function getHeroSlides(): Promise<HeroSlide[] | null> {
  return sdk.client
    .fetch<{ hero_slides: HeroSlide[] }>("/store/hero-slides", { method: "GET" })
    .then(({ hero_slides }) => hero_slides ?? [])
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
    .fetch<{ reviews: ProductReview[]; average_rating?: number; count?: number }>(
      `/store/reviews/product/${productId}`,
      { method: "GET" }
    )
    .then((data) => ({
      reviews: data.reviews ?? [],
      average: data.average_rating ?? 0,
      count: data.count ?? data.reviews?.length ?? 0,
    }))
    .catch(() => ({ reviews: [], average: 0, count: 0 }))
}

export async function createProductReview(
  productId: string,
  body: { rating: number; title?: string; content?: string }
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
