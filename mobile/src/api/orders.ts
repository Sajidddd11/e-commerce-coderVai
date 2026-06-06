import { HttpTypes } from "@medusajs/types"
import { sdk } from "./sdk"
import { getAuthHeaders } from "@utils/storage"

/** Ported from web src/lib/data/orders.ts (cache tags removed). */

export async function retrieveOrder(
  id: string
): Promise<HttpTypes.StoreOrder | null> {
  const headers = await getAuthHeaders()

  return sdk.client
    .fetch<{ order: HttpTypes.StoreOrder }>(`/store/orders/${id}`, {
      method: "GET",
      query: {
        fields:
          "+metadata,*payment_collections.payments,*items,*items.metadata,*items.variant,*items.product",
      },
      headers,
    })
    .then(({ order }) => order)
    .catch(() => null)
}

export async function listOrders(
  limit = 10,
  offset = 0,
  filters?: Record<string, any>
): Promise<HttpTypes.StoreOrder[]> {
  const headers = await getAuthHeaders()

  return sdk.client
    .fetch<HttpTypes.StoreOrderListResponse>(`/store/orders`, {
      method: "GET",
      query: {
        limit,
        offset,
        order: "-created_at",
        fields:
          "+metadata,*items,+items.metadata,*items.variant,*items.product",
        ...filters,
      },
      headers,
    })
    .then(({ orders }) => orders)
    .catch(() => [])
}

/** Best-effort order confirmation SMS — POST /store/orders/send-sms { order_id } */
export async function sendOrderSms(
  orderId: string
): Promise<{ success: boolean; message: string }> {
  const headers = await getAuthHeaders()

  try {
    const response = await sdk.client.fetch<{
      sent?: boolean
      message?: string
    }>(`/store/orders/send-sms`, {
      method: "POST",
      headers,
      body: { order_id: orderId },
    })
    return {
      success: !!response?.sent,
      message: response?.message ?? "OK",
    }
  } catch (e: any) {
    return { success: false, message: e?.message ?? "Failed to send SMS" }
  }
}

export async function createTransferRequest(
  orderId: string
): Promise<{ success: boolean; error: string | null; order?: HttpTypes.StoreOrder }> {
  const headers = await getAuthHeaders()

  try {
    const { order } = await sdk.store.order.requestTransfer(
      orderId,
      {},
      { fields: "id, email" },
      headers
    )
    return { success: true, error: null, order }
  } catch (e: any) {
    return { success: false, error: e?.message ?? "Could not request transfer" }
  }
}

export async function acceptTransferRequest(
  id: string,
  token: string
): Promise<{ success: boolean; error: string | null; order?: HttpTypes.StoreOrder }> {
  const headers = await getAuthHeaders()

  try {
    const { order } = await sdk.store.order.acceptTransfer(id, { token }, {}, headers)
    return { success: true, error: null, order }
  } catch (e: any) {
    return { success: false, error: e?.message ?? "Could not accept transfer" }
  }
}

export async function declineTransferRequest(
  id: string,
  token: string
): Promise<{ success: boolean; error: string | null; order?: HttpTypes.StoreOrder }> {
  const headers = await getAuthHeaders()

  try {
    const { order } = await sdk.store.order.declineTransfer(id, { token }, {}, headers)
    return { success: true, error: null, order }
  } catch (e: any) {
    return { success: false, error: e?.message ?? "Could not decline transfer" }
  }
}
