import { HttpTypes } from "@medusajs/types"
import { sdk } from "./sdk"
import { getAuthHeaders } from "@utils/storage"

/** Ported from web src/lib/data/payment.ts — always fetch fresh (no cache). */

export async function listCartPaymentMethods(
  regionId: string
): Promise<HttpTypes.StorePaymentProvider[] | null> {
  const headers = await getAuthHeaders()

  return sdk.client
    .fetch<HttpTypes.StorePaymentProviderListResponse>(
      `/store/payment-providers`,
      {
        method: "GET",
        query: { region_id: regionId },
        headers,
      }
    )
    .then(({ payment_providers }) =>
      payment_providers.sort((a, b) => (a.id > b.id ? 1 : -1))
    )
    .catch(() => null)
}
