"use server"

import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"
import { getCacheOptions, getAuthHeaders } from "./cookies"
import { getRegion } from "./regions"

export async function searchProducts({
  query,
  countryCode,
  limit = 8,
}: {
  query: string
  countryCode: string
  limit?: number
}): Promise<HttpTypes.StoreProduct[]> {
  if (!query || query.trim().length < 1) {
    return []
  }

  try {
    const region = await getRegion(countryCode)
    if (!region) {
      return []
    }

    const headers = {
      ...(await getAuthHeaders()),
    }

    const next = {
      ...(await getCacheOptions("products")),
    }

    const response = await sdk.client.fetch<{
      products: HttpTypes.StoreProduct[]
      count: number
    }>(`/store/products`, {
      method: "GET",
      query: {
        q: query,
        limit,
        region_id: region.id,
        fields:
          "*variants.calculated_price,+variants.inventory_quantity,*variants.images,+metadata,+tags",
      },
      headers,
      next,
    })

    return response.products || []
  } catch (error) {
    console.error("Error searching products:", error)
    return []
  }
}

export async function searchCategories({
  query,
  limit = 5,
}: {
  query: string
  limit?: number
}): Promise<HttpTypes.StoreProductCategory[]> {
  if (!query || query.trim().length < 1) {
    return []
  }

  try {
    const next = {
      ...(await getCacheOptions("categories")),
    }

    const response = await sdk.client.fetch<{
      product_categories: HttpTypes.StoreProductCategory[]
    }>(`/store/product-categories`, {
      method: "GET",
      query: {
        q: query,
        limit,
        fields: "*category_children, *products",
      },
      next,
    })

    return response.product_categories || []
  } catch (error) {
    console.error("Error searching categories:", error)
    return []
  }
}

export async function getCategories(): Promise<
  HttpTypes.StoreProductCategory[]
> {
  try {
    const next = {
      ...(await getCacheOptions("categories")),
      revalidate: 60,
    }

    const response = await sdk.client.fetch<{
      product_categories: HttpTypes.StoreProductCategory[]
    }>(`/store/product-categories`, {
      method: "GET",
      query: {
        fields: "*category_children, *products",
        limit: 100,
      },
      next,
    })

    return response.product_categories || []
  } catch (error) {
    console.error("Error fetching categories:", error)
    return []
  }
}
