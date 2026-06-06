import { HttpTypes } from "@medusajs/types"
import { sdk, DEFAULT_REGION } from "./sdk"

/** Ported from web src/lib/data/regions.ts (in-memory region map). */

const regionMap = new Map<string, HttpTypes.StoreRegion>()
let cachedRegions: HttpTypes.StoreRegion[] | null = null

export async function listRegions(): Promise<HttpTypes.StoreRegion[]> {
  if (cachedRegions) return cachedRegions
  const { regions } = await sdk.client.fetch<{
    regions: HttpTypes.StoreRegion[]
  }>("/store/regions", { method: "GET" })
  cachedRegions = regions
  return regions
}

export async function getRegion(
  countryCode: string
): Promise<HttpTypes.StoreRegion | null> {
  const code = countryCode?.toLowerCase()
  if (regionMap.has(code)) return regionMap.get(code) ?? null

  const regions = await listRegions()
  if (!regions?.length) return null

  regions.forEach((region) => {
    region.countries?.forEach((country) => {
      if (country?.iso_2) regionMap.set(country.iso_2.toLowerCase(), region)
    })
  })

  return regionMap.get(code) ?? regionMap.get(DEFAULT_REGION) ?? regions[0]
}

export async function retrieveRegion(
  id: string
): Promise<HttpTypes.StoreRegion> {
  const { region } = await sdk.client.fetch<{ region: HttpTypes.StoreRegion }>(
    `/store/regions/${id}`,
    { method: "GET" }
  )
  return region
}
