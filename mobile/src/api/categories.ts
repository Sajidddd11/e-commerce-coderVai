import { HttpTypes } from "@medusajs/types"
import { sdk } from "./sdk"

/** Ported from web src/lib/data/categories.ts */

export async function listCategories(query?: Record<string, any>) {
  const limit = query?.limit || 100

  const { product_categories } = await sdk.client.fetch<{
    product_categories: HttpTypes.StoreProductCategory[]
  }>("/store/product-categories", {
    method: "GET",
    query: {
      fields:
        "*category_children, *products, *parent_category, *parent_category.parent_category",
      limit,
      ...query,
    },
  })

  return product_categories
}

export async function getCategoryByHandle(categoryHandle: string[]) {
  const handle = `${categoryHandle.join("/")}`

  const { product_categories } = await sdk.client.fetch<{
    product_categories: HttpTypes.StoreProductCategory[]
  }>("/store/product-categories", {
    method: "GET",
    query: {
      fields: "*category_children, *products",
      handle,
    },
  })

  return product_categories?.[0] ?? null
}

/** Top-level categories that actually have products (for home/nav). */
export function filterCategoriesWithProducts(
  categories: HttpTypes.StoreProductCategory[]
) {
  return categories.filter(
    (c) => !c.parent_category_id && (c.products?.length ?? 0) > 0
  )
}
