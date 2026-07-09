"use server"

import { sdk } from "@lib/config"
import { getAuthHeaders } from "@lib/data/cookies"

/**
 * Server action to submit a product review.
 * Runs server-side so it has access to auth cookie and can inject
 * both the publishable API key (via the SDK) and the Bearer token.
 */
export async function submitProductReview(params: {
  productId: string
  orderId: string
  rating: number
  title: string
  content: string
  customerName: string
  customerEmail: string
}): Promise<{ success: boolean; message: string }> {
  try {
    const authHeaders = await getAuthHeaders()

    await sdk.client.fetch(`/store/reviews/product/${params.productId}`, {
      method: "POST",
      headers: {
        ...authHeaders,
      },
      body: {
        order_id: params.orderId,
        rating: params.rating,
        title: params.title,
        content: params.content,
        customer_name: params.customerName,
        customer_email: params.customerEmail,
      },
    })

    return { success: true, message: "Review submitted successfully. It will appear after admin approval." }
  } catch (err: any) {
    const msg: string =
      err?.message ||
      err?.response?.json?.message ||
      "Failed to submit review. Please try again."
    return { success: false, message: msg }
  }
}
