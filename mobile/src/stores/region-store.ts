import { create } from "zustand"
import { HttpTypes } from "@medusajs/types"
import { listRegions, getRegion } from "@api/regions"
import { DEFAULT_REGION } from "@api/sdk"
import { storage, STORAGE_KEYS } from "@utils/storage"

interface RegionState {
  countryCode: string
  region: HttpTypes.StoreRegion | null
  regions: HttpTypes.StoreRegion[]
  isLoading: boolean
  isReady: boolean
  init: () => Promise<void>
  setCountry: (countryCode: string) => Promise<void>
}

export const useRegionStore = create<RegionState>((set, get) => ({
  countryCode: DEFAULT_REGION,
  region: null,
  regions: [],
  isLoading: false,
  isReady: false,

  init: async () => {
    if (get().isReady) return
    set({ isLoading: true })
    try {
      const stored = await storage.get(STORAGE_KEYS.region)
      const countryCode = (stored || DEFAULT_REGION).toLowerCase()
      const [regions, region] = await Promise.all([
        listRegions(),
        getRegion(countryCode),
      ])
      set({
        regions,
        region,
        countryCode: region ? countryCode : DEFAULT_REGION,
        isReady: true,
      })
    } catch (e) {
      if (__DEV__) console.warn("[region-store] init failed", e)
    } finally {
      set({ isLoading: false })
    }
  },

  setCountry: async (countryCode: string) => {
    const code = countryCode.toLowerCase()
    set({ isLoading: true })
    try {
      const region = await getRegion(code)
      if (region) {
        await storage.set(STORAGE_KEYS.region, code)
        set({ countryCode: code, region })
      }
    } finally {
      set({ isLoading: false })
    }
  },
}))
