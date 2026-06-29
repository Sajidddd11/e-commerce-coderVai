import { create } from "zustand"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { getAppHeroSlides, HeroSlide } from "@api/enhancements"

// ─── Cache keys ───────────────────────────────────────────────────────────────
const CACHE_KEY_SLIDES   = "app_hero_slides_v1"
const CACHE_KEY_VERSION  = "app_hero_slides_version_v1"

// ─── Local fallback slides (shown when cache is empty and network unavailable) ─
const LOCAL_FALLBACK: HeroSlide[] = [
  {
    image: require("../../Hero/1.jpeg"),
    title: "New Season\nArrivals",
    subtitle: "2026 COLLECTION",
    link: "/(tabs)/shop",
  },
  {
    image: require("../../Hero/2.jpeg"),
    title: "Summer\nEssentials",
    subtitle: "TRENDING NOW",
    link: "/(tabs)/shop",
  },
  {
    image: require("../../Hero/3.jpeg"),
    title: "Everyday\nComfort",
    subtitle: "MUST HAVES",
    link: "/(tabs)/shop",
  },
]

// ─── Store interface ──────────────────────────────────────────────────────────
interface HeroState {
  slides: HeroSlide[]
  /** true after first hydration (cache or network) — UI should hide skeleton after this */
  isLoaded: boolean
  /**
   * init() — SWR pattern:
   *   1. Load cached slides from AsyncStorage immediately (zero network wait)
   *   2. In background: call server with current version string
   *      a. Server says "changed: false"  → nothing to do
   *      b. Server returns new slides      → update cache + re-render
   *   Falls back to LOCAL_FALLBACK if cache is empty and network fails.
   */
  init: () => Promise<void>
  /**
   * refresh() — forced refetch (e.g. pull-to-refresh).
   * Ignores cached version, always fetches full data.
   */
  refresh: () => Promise<void>
}

// ─── Store ────────────────────────────────────────────────────────────────────
export const useHeroStore = create<HeroState>((set, get) => ({
  slides: [],
  isLoaded: false,

  init: async () => {
    // ── Step 1: Hydrate from cache immediately ────────────────────────────
    try {
      const [cachedRaw, cachedVersion] = await Promise.all([
        AsyncStorage.getItem(CACHE_KEY_SLIDES),
        AsyncStorage.getItem(CACHE_KEY_VERSION),
      ])

      if (cachedRaw) {
        const cached: HeroSlide[] = JSON.parse(cachedRaw)
        if (cached.length > 0) {
          set({ slides: cached, isLoaded: true })
        }
      }

      // ── Step 2: Background revalidation ──────────────────────────────────
      // Send current version — if server returns null, our cache is already current
      const result = await getAppHeroSlides(cachedVersion ?? null)

      if (result === null) {
        // Server confirmed: nothing changed → keep showing cache
        // Ensure isLoaded is true even if we had no cache (edge case)
        if (!get().isLoaded) {
          set({ slides: LOCAL_FALLBACK, isLoaded: true })
        }
        return
      }

      // New slides received — update state and persist
      const newSlides = result.slides.length > 0 ? result.slides : LOCAL_FALLBACK
      set({ slides: newSlides, isLoaded: true })

      await Promise.all([
        AsyncStorage.setItem(CACHE_KEY_SLIDES,  JSON.stringify(result.slides)),
        AsyncStorage.setItem(CACHE_KEY_VERSION,  result.version),
      ])
    } catch (err) {
      if (__DEV__) console.warn("[hero-store] init error", err)
      // Ensure something is always shown
      if (!get().isLoaded) {
        set({ slides: LOCAL_FALLBACK, isLoaded: true })
      }
    }
  },

  refresh: async () => {
    try {
      // Force full fetch — don't pass a version so server always returns data
      const result = await getAppHeroSlides(null)
      if (!result) return

      const newSlides = result.slides.length > 0 ? result.slides : LOCAL_FALLBACK
      set({ slides: newSlides })

      await Promise.all([
        AsyncStorage.setItem(CACHE_KEY_SLIDES,  JSON.stringify(result.slides)),
        AsyncStorage.setItem(CACHE_KEY_VERSION,  result.version),
      ])
    } catch (err) {
      if (__DEV__) console.warn("[hero-store] refresh error", err)
    }
  },
}))
