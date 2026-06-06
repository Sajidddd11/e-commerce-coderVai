import { HttpTypes } from "@medusajs/types"
import {
  DHAKA_METRO_DISTRICTS,
  SHIPPING_COSTS,
  paymentInfoMap,
} from "@design/constants"
import { DeliveryType } from "@stores/checkout-store"

/** District → estimated shipping cost (BDT), matching web checkout logic. */
export function calculateShippingCost(
  district: string,
  deliveryType: DeliveryType
): number {
  if (deliveryType === "pickup") return SHIPPING_COSTS.pickup
  if (!district) return SHIPPING_COSTS.outsideDhaka
  const isDhakaMetro = DHAKA_METRO_DISTRICTS.some(
    (d) => d.toLowerCase() === district.toLowerCase()
  )
  return isDhakaMetro ? SHIPPING_COSTS.dhakaMetro : SHIPPING_COSTS.outsideDhaka
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

  const isDhakaMetro = DHAKA_METRO_DISTRICTS.some(
    (d) => d.toLowerCase() === district.toLowerCase()
  )
  const target = methods.find((m) => {
    const n = m.name?.toLowerCase() ?? ""
    return isDhakaMetro ? n.includes("inside dhaka") : n.includes("outside dhaka")
  })

  return target ?? methods[0] ?? null
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
