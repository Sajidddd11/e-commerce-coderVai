import { HttpTypes } from "@medusajs/types"
import {
  SHIPPING_COSTS,
  paymentInfoMap,
} from "@design/constants"
import { DeliveryType } from "@stores/checkout-store"

/** District → estimated shipping cost (BDT), matching web checkout logic.
 *  Only the city of "Dhaka" qualifies as Inside Dhaka (80 BDT);
 *  every other district — including Gazipur, Narayanganj, etc. — is
 *  Outside Dhaka (130 BDT), matching the web consolidated-checkout-form.
 */
export function calculateShippingCost(
  district: string,
  deliveryType: DeliveryType
): number {
  if (deliveryType === "pickup") return SHIPPING_COSTS.pickup
  if (!district) return SHIPPING_COSTS.outsideDhaka
  const isInsideDhaka = district.toLowerCase() === "dhaka"
  return isInsideDhaka ? SHIPPING_COSTS.dhakaMetro : SHIPPING_COSTS.outsideDhaka
}

/**
 * Auto-select the matching shipping option for the chosen delivery type +
 * district by name (mirrors web consolidated-checkout-form).
 */
export function autoSelectShippingMethod(
  methods: HttpTypes.StoreCartShippingOption[],
  deliveryType: DeliveryType,
  district: string
): HttpTypes.StoreCartShippingOption | null {
  if (!methods.length) return null

  if (deliveryType === "pickup") {
    return (
      methods.find((m) => {
        const n = m.name?.toLowerCase() ?? ""
        return (
          n.includes("collect from store") ||
          n.includes("pickup") ||
          n.includes("store")
        )
      }) ?? null
    )
  }

  // Match web logic: only literal "dhaka" → Inside Dhaka method
  const isInsideDhaka = district.toLowerCase() === "dhaka"
  const target = methods.find((m) => {
    const n = m.name?.toLowerCase() ?? ""
    return isInsideDhaka ? n.includes("inside dhaka") : n.includes("outside dhaka")
  })

  // Do NOT fall back to methods[0] — an incorrect fallback would lock the
  // shipping method to Inside Dhaka even for outside-Dhaka districts.
  return target ?? null
}

/**
 * Inject virtual bKash / Nagad options when SSLCommerz is available, matching
 * the web checkout. The virtual ids are mapped back before payment init.
 */
export function enhancePaymentMethods(
  providers: HttpTypes.StorePaymentProvider[]
): HttpTypes.StorePaymentProvider[] {
  const ssl = providers.find((p) => p.id === "pp_sslcommerz_default")
  if (!ssl) return providers

  return [
    ...providers.filter((p) => p.id !== "pp_sslcommerz_default"),
    { ...ssl, id: "pp_sslcommerz_default_bkash" },
    { ...ssl, id: "pp_sslcommerz_default_nagad" },
    ssl,
  ]
}

export function paymentTitle(providerId: string): string {
  return paymentInfoMap[providerId]?.title ?? providerId
}
