import { HttpTypes } from "@medusajs/types"
import { sdk } from "./sdk"
import { getAuthHeaders } from "@utils/storage"
import {
  getCartId,
  retrieveCart,
  setShippingMethod,
  initiatePaymentSession,
} from "./cart"

/**
 * Consolidated checkout step, ported from web src/lib/data/checkout.ts.
 * Performs: update cart (address + email + metadata) → add shipping method →
 * initiate payment session (mapping virtual bKash/Nagad provider ids).
 * Returns the refreshed cart so the review screen can render + place order.
 */

export interface PrepareCheckoutInput {
  fullName: string
  address1: string
  city: string
  countryCode: string
  phone: string
  company?: string
  email: string
  deliveryInstructions?: string
  shippingMethodId: string
  paymentProviderId: string
  /** Deep link or URL for SSLCommerz to redirect back to after payment */
  returnUrl?: string
}

export interface PrepareCheckoutResult {
  success: boolean
  error?: string
  cart?: HttpTypes.StoreCart
}

function mapProvider(paymentProviderId: string): {
  actualProviderId: string
  selectedGateway: string | null
} {
  if (paymentProviderId === "pp_sslcommerz_default_bkash") {
    return { actualProviderId: "pp_sslcommerz_default", selectedGateway: "bkash" }
  }
  if (paymentProviderId === "pp_sslcommerz_default_nagad") {
    return { actualProviderId: "pp_sslcommerz_default", selectedGateway: "nagad" }
  }
  return { actualProviderId: paymentProviderId, selectedGateway: null }
}

export async function prepareCheckout(
  input: PrepareCheckoutInput
): Promise<PrepareCheckoutResult> {
  try {
    const cartId = await getCartId()
    if (!cartId) return { success: false, error: "No cart found" }

    const trimmedName = input.fullName.trim()
    if (!trimmedName) return { success: false, error: "Full name is required" }
    if (!input.countryCode) return { success: false, error: "Country is required" }
    if (!input.shippingMethodId)
      return { success: false, error: "Please select a delivery option" }
    if (!input.paymentProviderId)
      return { success: false, error: "Please select a payment method" }

    const nameParts = trimmedName.split(" ")
    const firstName = nameParts[0] ?? ""
    const lastName = nameParts.slice(1).join(" ") || firstName

    const headers = await getAuthHeaders()

    // 1 — Update cart addresses + email + delivery instructions
    const addressData: HttpTypes.StoreUpdateCart = {
      shipping_address: {
        first_name: firstName,
        last_name: lastName,
        address_1: input.address1,
        address_2: "",
        city: input.city,
        country_code: input.countryCode,
        phone: input.phone,
        company: input.company || "",
      },
      email: input.email,
      metadata: {
        delivery_instructions: input.deliveryInstructions || "",
      },
    }
    addressData.billing_address = addressData.shipping_address
    await sdk.store.cart.update(cartId, addressData, {}, headers)

    // 2 — Shipping method
    await setShippingMethod({ cartId, shippingMethodId: input.shippingMethodId })

    // 3 — Retrieve cart, init payment session (mapping virtual providers)
    const cart = await retrieveCart(cartId)
    if (!cart) return { success: false, error: "Could not load cart" }

    const { actualProviderId, selectedGateway } = mapProvider(
      input.paymentProviderId
    )

    await initiatePaymentSession(
      cart,
      {
        provider_id: actualProviderId,
        data: { selected_gateway: selectedGateway },
      } as HttpTypes.StoreInitializePaymentSession,
      // Pass mobile deep-link so backend redirects to app instead of web storefront
      input.returnUrl ? { returnUrl: input.returnUrl } : undefined
    )

    const refreshed = await retrieveCart(cartId)
    return { success: true, cart: refreshed ?? cart }
  } catch (e: any) {
    return { success: false, error: e?.message ?? "Checkout failed" }
  }
}
