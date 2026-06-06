import { HttpTypes } from "@medusajs/types"
import { sdk } from "./sdk"
import { getRegion, retrieveRegion } from "./regions"
import { sortProducts, SortOptions } from "@utils/sort-products"

/** Ported from web src/lib/data/products.ts (cache logic removed for mobile). */

const PRODUCT_FIELDS =
  "*variants.calculated_price,+variants.inventory_quantity,*variants.images,*images,+metadata,+tags,*categories,*collection"

export async function listProducts({
  pageParam = 1,
  queryParams,
  countryCode,
  regionId,
}: {
  pageParam?: number
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductListParams
  countryCode?: string
  regionId?: string
}): Promise<{
  response: { products: HttpTypes.StoreProduct[]; count: number }
  nextPage: number | null
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductListParams
}> {
  if (!countryCode && !regionId) {
    throw new Error("Country code or region ID is required")
  }

  const limit = queryParams?.limit || 12
  const _pageParam = Math.max(pageParam, 1)
  const offset = _pageParam === 1 ? 0 : (_pageParam - 1) * limit

  const region = countryCode
    ? await getRegion(countryCode)
    : await retrieveRegion(regionId!)

  if (!region) {
    return { response: { products: [], count: 0 }, nextPage: null }
  }

  const { products, count } = await sdk.client.fetch<{
    products: HttpTypes.StoreProduct[]
    count: number
  }>("/store/products", {
    method: "GET",
    query: {
      limit,
      offset,
      region_id: region.id,
      fields: PRODUCT_FIELDS,
      ...queryParams,
    },
  })

  const nextPage = count > offset + limit ? pageParam + 1 : null

  return {
    response: { products, count },
    nextPage,
    queryParams,
  }
}

/**
 * Fetches up to 100 products and sorts client-side (matches web behaviour
 * since Medusa can't sort by calculated price).
 */
export async function listProductsWithSort({
  page = 1,
  queryParams,
  sortBy = "created_at",
  countryCode,
}: {
  page?: number
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductListParams
  sortBy?: SortOptions
  countryCode: string
}): Promise<{
  response: { products: HttpTypes.StoreProduct[]; count: number }
  nextPage: number | null
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductListParams
}> {
  const limit = queryParams?.limit || 12

  let products: HttpTypes.StoreProduct[] = []
  let count = 0

  if (sortBy === "best_selling") {
    const region = await getRegion(countryCode)
    if (region) {
      try {
        const res = await sdk.client.fetch<{ products: HttpTypes.StoreProduct[]; count: number }>(
          "/store/best-selling",
          {
            method: "GET",
            query: { region_id: region.id, limit: 100 }
          }
        )
        products = res.products ?? []
      } catch (err) {
        if (__DEV__) console.warn("[listProductsWithSort] best-selling fetch failed", err)
        products = []
      }
    }

    // Apply filters client-side
    if (queryParams?.q && typeof queryParams.q === "string") {
      const qLower = queryParams.q.toLowerCase()
      products = products.filter(
        (p) =>
          p.title?.toLowerCase().includes(qLower) ||
          p.subtitle?.toLowerCase().includes(qLower) ||
          p.description?.toLowerCase().includes(qLower)
      )
    }

    if (queryParams?.category_id) {
      const categoryIds = Array.isArray(queryParams.category_id)
        ? queryParams.category_id
        : [queryParams.category_id]
      products = products.filter((p) =>
        p.categories?.some((cat) => categoryIds.includes(cat.id))
      )
    }

    if (queryParams?.collection_id) {
      const collectionIds = Array.isArray(queryParams.collection_id)
        ? queryParams.collection_id
        : [queryParams.collection_id]
      products = products.filter((p) =>
        p.collection_id && collectionIds.includes(p.collection_id)
      )
    }

    count = products.length
  } else {
    const res = await listProducts({
      pageParam: 0,
      queryParams: { ...queryParams, limit: 100 },
      countryCode,
    })
    products = res.response.products
    count = res.response.count
  }

  const sortedProducts = sortProducts(products, sortBy)

  const pageParam = (page - 1) * limit
  const nextPage = count > pageParam + limit ? pageParam + limit : null
  const paginatedProducts = sortedProducts.slice(pageParam, pageParam + limit)

  return {
    response: { products: paginatedProducts, count },
    nextPage,
    queryParams,
  }
}

export async function getProductByHandle(
  handle: string,
  regionId: string
): Promise<HttpTypes.StoreProduct | null> {
  const { products } = await sdk.client.fetch<{
    products: HttpTypes.StoreProduct[]
  }>("/store/products", {
    method: "GET",
    query: {
      handle,
      region_id: regionId,
      fields: PRODUCT_FIELDS,
      limit: 1,
    },
  })

  return products?.[0] ?? null
}
