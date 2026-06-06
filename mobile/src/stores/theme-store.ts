import { create } from "zustand"
import { storage, STORAGE_KEYS } from "@utils/storage"

export type ThemePreference = "system" | "light" | "dark"

interface ThemeState {
  themePreference: ThemePreference
  isReady: boolean
  init: () => Promise<void>
  setThemePreference: (theme: ThemePreference) => Promise<void>
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  themePreference: "system",
  isReady: false,

  init: async () => {
    if (get().isReady) return
    try {
      const stored = await storage.get(STORAGE_KEYS.theme)
      if (stored === "light" || stored === "dark" || stored === "system") {
        set({ themePreference: stored })
      }
    } catch (e) {
      if (__DEV__) console.warn("[theme-store] init failed", e)
    } finally {
      set({ isReady: true })
    }
  },

  setThemePreference: async (theme: ThemePreference) => {
    set({ themePreference: theme })
    try {
      await storage.set(STORAGE_KEYS.theme, theme)
    } catch (e) {
      if (__DEV__) console.warn("[theme-store] set failed", e)
    }
  },
}))
