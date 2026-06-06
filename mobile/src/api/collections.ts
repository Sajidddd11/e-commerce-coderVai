import { HttpTypes } from "@medusajs/types"
import { sdk } from "./sdk"

/** Ported from web src/lib/data/collections.ts */

export async function listCollections(
  queryParams: Record<string, string> = {}
): Promise<{ collections: HttpTypes.StoreCollection[]; count: number }> {
  const query = { limit: "100", offset: "0", ...queryParams }

  return sdk.client.fetch<{
    collections: HttpTypes.StoreCollection[]
    count: number
  }>("/store/collections", {
    method: "GET",
    query,
  })
}

export async function getCollectionByHandle(
  handle: string
): Promise<HttpTypes.StoreCollection | null> {
  const { collections } = await sdk.client.fetch<{
    collections: HttpTypes.StoreCollection[]
  }>("/store/collections", {
    method: "GET",
    query: { handle, fields: "*products" },
  })

  return collections?.[0] ?? null
}
