import { create } from "zustand"
import { HttpTypes } from "@medusajs/types"
import {
  retrieveCart,
  addToCart,
  updateLineItem,
  deleteLineItem,
  applyPromotions,
  getCartItemCount,
  removeCartId,
} from "@api/cart"

interface CartState {
  cart: HttpTypes.StoreCart | null
  itemCount: number
  isLoading: boolean
  isMutating: boolean
  refresh: () => Promise<void>
  add: (variantId: string, quantity: number, countryCode: string) => Promise<void>
  update: (lineId: string, quantity: number) => Promise<void>
  remove: (lineId: string) => Promise<void>
  applyPromo: (codes: string[]) => Promise<void>
  setCart: (cart: HttpTypes.StoreCart | null) => void
  clear: () => Promise<void>
}

export const useCartStore = create<CartState>((set) => ({
  cart: null,
  itemCount: 0,
  isLoading: false,
  isMutating: false,

  setCart: (cart) => set({ cart, itemCount: getCartItemCount(cart) }),

  clear: async () => {
    set({ isMutating: true })
    try {
      await removeCartId()
      set({ cart: null, itemCount: 0 })
    } finally {
      set({ isMutating: false })
    }
  },

  refresh: async () => {
    set({ isLoading: true })
    try {
      const cart = await retrieveCart()
      set({ cart, itemCount: getCartItemCount(cart) })
    } finally {
      set({ isLoading: false })
    }
  },

  add: async (variantId, quantity, countryCode) => {
    set({ isMutating: true })
    try {
      const cart = await addToCart({ variantId, quantity, countryCode })
      set({ cart, itemCount: getCartItemCount(cart) })
    } finally {
      set({ isMutating: false })
    }
  },

  update: async (lineId, quantity) => {
    set({ isMutating: true })
    try {
      const cart = await updateLineItem({ lineId, quantity })
      if (cart) set({ cart, itemCount: getCartItemCount(cart) })
    } catch (e) {
      console.warn("[cart] update failed", e)
      // Re-sync from server so UI reflects true state
      try {
        const fresh = await retrieveCart()
        set({ cart: fresh, itemCount: getCartItemCount(fresh) })
      } catch {}
    } finally {
      set({ isMutating: false })
    }
  },

  remove: async (lineId) => {
    set({ isMutating: true })
    try {
      const cart = await deleteLineItem(lineId)
      if (cart) {
        set({ cart, itemCount: getCartItemCount(cart) })
      } else {
        // deleteLineItem returned null – re-fetch to get fresh state
        const fresh = await retrieveCart()
        set({ cart: fresh, itemCount: getCartItemCount(fresh) })
      }
    } catch (e) {
      console.warn("[cart] remove failed", e)
      try {
        const fresh = await retrieveCart()
        set({ cart: fresh, itemCount: getCartItemCount(fresh) })
      } catch {}
    } finally {
      set({ isMutating: false })
    }
  },

  applyPromo: async (codes) => {
    set({ isMutating: true })
    try {
      const cart = await applyPromotions(codes)
      set({ cart, itemCount: getCartItemCount(cart) })
    } finally {
      set({ isMutating: false })
    }
  },
}))
