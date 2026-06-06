import { create } from "zustand"
import { storage, STORAGE_KEYS } from "@utils/storage"

export type DeliveryType = "home" | "pickup"

export interface CheckoutForm {
  fullName: string
  email: string
  phone: string
  address1: string
  district: string
  company: string
  deliveryInstructions: string
  deliveryType: DeliveryType
  shippingMethodId: string
  paymentProviderId: string
}

const EMPTY: CheckoutForm = {
  fullName: "",
  email: "",
  phone: "",
  address1: "",
  district: "",
  company: "",
  deliveryInstructions: "",
  deliveryType: "home",
  shippingMethodId: "",
  paymentProviderId: "",
}

interface CheckoutState {
  form: CheckoutForm
  hydrated: boolean
  set: (patch: Partial<CheckoutForm>) => void
  hydrate: () => Promise<void>
  reset: () => Promise<void>
}

let saveTimer: ReturnType<typeof setTimeout> | null = null

export const useCheckoutStore = create<CheckoutState>((set, get) => ({
  form: EMPTY,
  hydrated: false,

  set: (patch) => {
    const form = { ...get().form, ...patch }
    set({ form })
    if (saveTimer) clearTimeout(saveTimer)
    saveTimer = setTimeout(() => {
      storage.set(STORAGE_KEYS.checkoutForm, JSON.stringify(form)).catch(() => {})
    }, 600)
  },

  hydrate: async () => {
    if (get().hydrated) return
    try {
      const raw = await storage.get(STORAGE_KEYS.checkoutForm)
      if (raw) {
        const saved = JSON.parse(raw) as Partial<CheckoutForm>
        set({ form: { ...EMPTY, ...saved }, hydrated: true })
        return
      }
    } catch {
      // ignore corrupt drafts
    }
    set({ hydrated: true })
  },

  reset: async () => {
    set({ form: EMPTY })
    await storage.remove(STORAGE_KEYS.checkoutForm).catch(() => {})
  },
}))
