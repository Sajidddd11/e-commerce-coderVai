import { HttpTypes } from "@medusajs/types"

/** Ported from web src/lib/util/sort-products.ts */
export type SortOptions = "price_asc" | "price_desc" | "created_at"

type SortableProduct = {
  created_at?: string | null
  variants?: any
}

/**
 * Client-side sort (Medusa store API can't sort by calculated price).
 * Web fetches up to 100 products then sorts in memory.
 */
export function sortProducts<T extends SortableProduct>(
  products: T[],
  sortBy: SortOptions
): T[] {
  let sorted = [...products]

  if (sortBy === "price_asc" || sortBy === "price_desc") {
    sorted = sorted.sort((a, b) => {
      const aPrice = a.variants?.[0]?.calculated_price?.calculated_amount ?? 0
      const bPrice = b.variants?.[0]?.calculated_price?.calculated_amount ?? 0
      return sortBy === "price_asc" ? aPrice - bPrice : bPrice - aPrice
    })
  }

  if (sortBy === "created_at") {
    sorted = sorted.sort((a, b) => {
      return (
        new Date(b.created_at ?? 0).getTime() -
        new Date(a.created_at ?? 0).getTime()
      )
    })
  }

  return sorted
}
