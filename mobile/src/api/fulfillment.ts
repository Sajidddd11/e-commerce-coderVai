import { HttpTypes } from "@medusajs/types"
import { sdk } from "./sdk"
import { getAuthHeaders } from "@utils/storage"

/** Ported from web src/lib/data/fulfillment.ts (cache logic removed). */

export async function listCartShippingMethods(
  cartId: string
): Promise<HttpTypes.StoreCartShippingOption[] | null> {
  const headers = await getAuthHeaders()

  return sdk.client
    .fetch<HttpTypes.StoreShippingOptionListResponse>(`/store/shipping-options`, {
      method: "GET",
      query: { cart_id: cartId, fields: "+service_zone.fulfillment_set.type" },
      headers,
    })
    .then(({ shipping_options }) => shipping_options)
    .catch(() => null)
}

export async function calculatePriceForShippingOption(
  optionId: string,
  cartId: string,
  data?: Record<string, unknown>
): Promise<HttpTypes.StoreCartShippingOption | null> {
  const headers = await getAuthHeaders()

  const body = { cart_id: cartId, data }

  return sdk.client
    .fetch<{ shipping_option: HttpTypes.StoreCartShippingOption }>(
      `/store/shipping-options/${optionId}/calculate`,
      {
        method: "POST",
        body,
        headers,
      }
    )
    .then(({ shipping_option }) => shipping_option)
    .catch(() => null)
}
