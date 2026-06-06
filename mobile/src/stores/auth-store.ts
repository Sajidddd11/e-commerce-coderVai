import { create } from "zustand"
import { HttpTypes } from "@medusajs/types"
import { retrieveCustomer, signout } from "@api/customer"

interface AuthState {
  customer: HttpTypes.StoreCustomer | null
  isAuthenticated: boolean
  isLoading: boolean
  load: () => Promise<void>
  setCustomer: (customer: HttpTypes.StoreCustomer | null) => void
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  customer: null,
  isAuthenticated: false,
  isLoading: false,

  setCustomer: (customer) =>
    set({ customer, isAuthenticated: !!customer }),

  load: async () => {
    set({ isLoading: true })
    try {
      const customer = await retrieveCustomer()
      set({ customer, isAuthenticated: !!customer })
    } finally {
      set({ isLoading: false })
    }
  },

  logout: async () => {
    await signout()
    set({ customer: null, isAuthenticated: false })
  },
}))
