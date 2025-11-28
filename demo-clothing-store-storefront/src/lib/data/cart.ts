"use server"

import { sdk } from "@lib/config"
import medusaError from "@lib/util/medusa-error"
import { HttpTypes } from "@medusajs/types"
import { revalidateTag } from "next/cache"
import { redirect } from "next/navigation"
import {
  getAuthHeaders,
  getCacheOptions,
  getCacheTag,
  getCartId,
  removeCartId,
  setCartId,
} from "./cookies"
import { getRegion, retrieveRegion } from "./regions"

/**
 * Retrieves a cart by its ID. If no ID is provided, it will use the cart ID from the cookies.
 * @param cartId - optional - The ID of the cart to retrieve.
 * @returns The cart object if found, or null if not found.
 */
export async function retrieveCart(cartId?: string, fields?: string) {
  const id = cartId || (await getCartId())
  fields ??= "*items, *region, *items.product, *items.variant, *items.thumbnail, *items.metadata, +items.total, *promotions, +shipping_methods.name"

  if (!id) {
    return null
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  const next = {
    ...(await getCacheOptions("carts")),
  }

  return await sdk.client
    .fetch<HttpTypes.StoreCartResponse>(`/store/carts/${id}`, {
      method: "GET",
      query: {
        fields
      },
      headers,
      next,
      cache: "force-cache",
    })
    .then(({ cart }: { cart: HttpTypes.StoreCart }) => cart)
    .catch(() => null)
}

export async function getOrSetCart(countryCode: string) {
  const region = await getRegion(countryCode)

  if (!region) {
    throw new Error(`Region not found for country code: ${countryCode}`)
  }

  let cart = await retrieveCart(undefined, 'id,region_id')

  const headers = {
    ...(await getAuthHeaders()),
  }

  if (!cart) {
    const cartResp = await sdk.store.cart.create(
      { region_id: region.id },
      {},
      headers
    )
    cart = cartResp.cart

    await setCartId(cart.id)

    const cartCacheTag = await getCacheTag("carts")
    revalidateTag(cartCacheTag)
  }

  if (cart && cart?.region_id !== region.id) {
    await sdk.store.cart.update(cart.id, { region_id: region.id }, {}, headers)
    const cartCacheTag = await getCacheTag("carts")
    revalidateTag(cartCacheTag)
  }

  return cart
}

export async function updateCart(data: HttpTypes.StoreUpdateCart) {
  const cartId = await getCartId()

  if (!cartId) {
    throw new Error("No existing cart found, please create one before updating")
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.store.cart
    .update(cartId, data, {}, headers)
    .then(async ({ cart }: { cart: HttpTypes.StoreCart }) => {
      const cartCacheTag = await getCacheTag("carts")
      revalidateTag(cartCacheTag)

      const fulfillmentCacheTag = await getCacheTag("fulfillment")
      revalidateTag(fulfillmentCacheTag)

      return cart
    })
    .catch(medusaError)
}

export async function addToCart({
  variantId,
  quantity,
  countryCode,
}: {
  variantId: string
  quantity: number
  countryCode: string
}) {
  if (!variantId) {
    throw new Error("Missing variant ID when adding to cart")
  }

  const cart = await getOrSetCart(countryCode)

  if (!cart) {
    throw new Error("Error retrieving or creating cart")
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  await sdk.store.cart
    .createLineItem(
      cart.id,
      {
        variant_id: variantId,
        quantity,
      },
      {},
      headers
    )
    .then(async () => {
      const cartCacheTag = await getCacheTag("carts")
      revalidateTag(cartCacheTag)

      const fulfillmentCacheTag = await getCacheTag("fulfillment")
      revalidateTag(fulfillmentCacheTag)
    })
    .catch(medusaError)
}

export async function updateLineItem({
  lineId,
  quantity,
}: {
  lineId: string
  quantity: number
}) {
  if (!lineId) {
    throw new Error("Missing lineItem ID when updating line item")
  }

  const cartId = await getCartId()

  if (!cartId) {
    throw new Error("Missing cart ID when updating line item")
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  await sdk.store.cart
    .updateLineItem(cartId, lineId, { quantity }, {}, headers)
    .then(async () => {
      const cartCacheTag = await getCacheTag("carts")
      revalidateTag(cartCacheTag)

      const fulfillmentCacheTag = await getCacheTag("fulfillment")
      revalidateTag(fulfillmentCacheTag)
    })
    .catch(medusaError)
}

export async function deleteLineItem(lineId: string) {
  if (!lineId) {
    throw new Error("Missing lineItem ID when deleting line item")
  }

  const cartId = await getCartId()

  if (!cartId) {
    throw new Error("Missing cart ID when deleting line item")
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  await sdk.store.cart
    .deleteLineItem(cartId, lineId, headers)
    .then(async () => {
      const cartCacheTag = await getCacheTag("carts")
      revalidateTag(cartCacheTag)

      const fulfillmentCacheTag = await getCacheTag("fulfillment")
      revalidateTag(fulfillmentCacheTag)
    })
    .catch(medusaError)
}

export async function setShippingMethod({
  cartId,
  shippingMethodId,
}: {
  cartId: string
  shippingMethodId: string
}) {
  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.store.cart
    .addShippingMethod(cartId, { option_id: shippingMethodId }, {}, headers)
    .then(async () => {
      const cartCacheTag = await getCacheTag("carts")
      revalidateTag(cartCacheTag)
    })
    .catch(medusaError)
}

export async function initiatePaymentSession(
  cart: HttpTypes.StoreCart,
  data: HttpTypes.StoreInitializePaymentSession
) {
  const headers = {
    ...(await getAuthHeaders()),
  }

  // Pass cart data via data.data (additional_data field)
  // This gets passed to the payment provider's initiatePayment method
  const enrichedData = {
    ...data,
    data: {
      ...(data.data || {}),
      cart: {
        id: cart.id,
        email: cart.email,
        billing_address: cart.billing_address,
        shipping_address: cart.shipping_address,
      },
    },
  }

  return sdk.store.payment
    .initiatePaymentSession(cart, enrichedData, {}, headers)
    .then(async (resp) => {
      const cartCacheTag = await getCacheTag("carts")
      revalidateTag(cartCacheTag)
      return resp
    })
    .catch(medusaError)
}

export async function applyPromotions(codes: string[]) {
  const cartId = await getCartId()

  if (!cartId) {
    throw new Error("No existing cart found")
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.store.cart
    .update(cartId, { promo_codes: codes }, {}, headers)
    .then(async () => {
      const cartCacheTag = await getCacheTag("carts")
      revalidateTag(cartCacheTag)

      const fulfillmentCacheTag = await getCacheTag("fulfillment")
      revalidateTag(fulfillmentCacheTag)
    })
    .catch(medusaError)
}

export async function applyGiftCard(code: string) {
  //   const cartId = getCartId()
  //   if (!cartId) return "No cartId cookie found"
  //   try {
  //     await updateCart(cartId, { gift_cards: [{ code }] }).then(() => {
  //       revalidateTag("cart")
  //     })
  //   } catch (error: any) {
  //     throw error
  //   }
}

export async function removeDiscount(code: string) {
  // const cartId = getCartId()
  // if (!cartId) return "No cartId cookie found"
  // try {
  //   await deleteDiscount(cartId, code)
  //   revalidateTag("cart")
  // } catch (error: any) {
  //   throw error
  // }
}

export async function removeGiftCard(
  codeToRemove: string,
  giftCards: any[]
  // giftCards: GiftCard[]
) {
  //   const cartId = getCartId()
  //   if (!cartId) return "No cartId cookie found"
  //   try {
  //     await updateCart(cartId, {
  //       gift_cards: [...giftCards]
  //         .filter((gc) => gc.code !== codeToRemove)
  //         .map((gc) => ({ code: gc.code })),
  //     }).then(() => {
  //       revalidateTag("cart")
  //     })
  //   } catch (error: any) {
  //     throw error
  //   }
}

export async function submitPromotionForm(
  currentState: unknown,
  formData: FormData
) {
  const code = formData.get("code") as string
  try {
    await applyPromotions([code])
  } catch (e: any) {
    return e.message
  }
}

// TODO: Pass a POJO instead of a form entity here
export async function setAddresses(currentState: unknown, formData: FormData) {
  try {
    if (!formData) {
      throw new Error("No form data found when setting addresses")
    }
    const cartId = getCartId()
    if (!cartId) {
      throw new Error("No existing cart found when setting addresses")
    }

    const data = {
      shipping_address: {
        first_name: formData.get("shipping_address.first_name"),
        last_name: formData.get("shipping_address.last_name"),
        address_1: formData.get("shipping_address.address_1"),
        address_2: "",
        company: formData.get("shipping_address.company"),
        postal_code: formData.get("shipping_address.postal_code"),
        city: formData.get("shipping_address.city"),
        country_code: formData.get("shipping_address.country_code"),
        province: formData.get("shipping_address.province"),
        phone: formData.get("shipping_address.phone"),
      },
      email: formData.get("email"),
    } as any

    const sameAsBilling = formData.get("same_as_billing")
    if (sameAsBilling === "on") data.billing_address = data.shipping_address

    if (sameAsBilling !== "on")
      data.billing_address = {
        first_name: formData.get("billing_address.first_name"),
        last_name: formData.get("billing_address.last_name"),
        address_1: formData.get("billing_address.address_1"),
        address_2: "",
        company: formData.get("billing_address.company"),
        postal_code: formData.get("billing_address.postal_code"),
        city: formData.get("billing_address.city"),
        country_code: formData.get("billing_address.country_code"),
        province: formData.get("billing_address.province"),
        phone: formData.get("billing_address.phone"),
      }
    await updateCart(data)
  } catch (e: any) {
    return e.message
  }

  redirect(
    `/${formData.get("shipping_address.country_code")}/checkout?step=delivery`
  )
}

/**
 * Generates a unique idempotency key for cart completion
 */
function generateIdempotencyKey(cartId: string): string {
  return `complete_${cartId}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

/**
 * Places an order for a cart. If no cart ID is provided, it will use the cart ID from the cookies.
 * @param cartId - optional - The ID of the cart to place an order for.
 * @returns The cart object if the order was successful, or null if not.
 */
export async function placeOrder(cartId?: string) {
  const id = cartId || (await getCartId())

  if (!id) {
    throw new Error("No existing cart found when placing an order")
  }

  // Check if cart is already completed
  let cart
  try {
    cart = await retrieveCart(id, "id,completed_at")
  } catch (e) {
    console.log("[PlaceOrder] Could not retrieve cart, proceeding with completion:", e)
    // Continue anyway - cart might still be valid
  }

  if (cart && (cart as any).completed_at) {
    // Cart is already completed, try to find the order (only for authenticated users)
    try {
      const headers = await getAuthHeaders()
      // Only try to get orders if we have auth headers (user is logged in)
      if (headers && Object.keys(headers).length > 0) {
        const orders = await sdk.store.order.list(
          { limit: 5, order: "-created_at", fields: "+email" } as any,
          headers
        )

        if (orders?.orders && orders.orders.length > 0) {
          const recentOrder = orders.orders[0]
          const isRecent = (Date.now() - new Date(recentOrder.created_at).getTime()) < 300000 // 5 min

          if (isRecent) {
            const countryCode = recentOrder.shipping_address?.country_code?.toLowerCase()
            removeCartId()
            redirect(`/${countryCode}/order/${recentOrder.id}/confirmed`)
            return
          }
        }
      }
    } catch (e) {
      console.log("[PlaceOrder] Could not retrieve order for completed cart:", e)
    }

    // Cart completed but can't find order - for guest users, redirect to home
    // For logged in users, redirect to orders page
    try {
      const headers = await getAuthHeaders()
      if (headers && Object.keys(headers).length > 0) {
        redirect("/account/orders")
      } else {
        // Guest user - redirect to home with success message
        removeCartId()
        redirect("/?order=completed")
      }
    } catch {
      // Fallback - redirect to home
      removeCartId()
      redirect("/?order=completed")
    }
    return
  }

  const headers = {
    ...(await getAuthHeaders()),
    "Idempotency-Key": generateIdempotencyKey(id),
  }

  try {
    console.log("[PlaceOrder] Attempting to complete cart:", id)
    const cartRes = await sdk.store.cart
      .complete(id, {}, headers)
      .then(async (cartRes) => {
        console.log("[PlaceOrder] Cart completion response:", cartRes?.type)
        const cartCacheTag = await getCacheTag("carts")
        revalidateTag(cartCacheTag)
        return cartRes
      })

    if (cartRes?.type === "order") {
      console.log("[PlaceOrder] Order created successfully:", cartRes.order.id)
      
      // Get country code from order, or fallback to cart region, or default to "bd"
      let countryCode =
        cartRes.order.shipping_address?.country_code?.toLowerCase() ||
        cartRes.order.billing_address?.country_code?.toLowerCase()
      
      // If still no country code, try to get from cart's region
      if (!countryCode) {
        try {
          const currentCart = await retrieveCart(id, "region_id")
          if (currentCart?.region_id) {
            const region = await retrieveRegion(currentCart.region_id)
            countryCode = region?.countries?.[0]?.iso_2?.toLowerCase()
          }
        } catch (e) {
          console.log("[PlaceOrder] Could not get country code from cart:", e)
        }
      }
      
      // Final fallback to "bd" (Bangladesh)
      countryCode = countryCode || "bd"

      console.log("[PlaceOrder] Redirecting to order confirmation with countryCode:", countryCode)

      const orderCacheTag = await getCacheTag("orders")
      revalidateTag(orderCacheTag)

      removeCartId()
      redirect(`/${countryCode}/order/${cartRes?.order.id}/confirmed`)
    } else {
      console.log("[PlaceOrder] Cart completion did not create an order. Response type:", cartRes?.type)
      throw new Error("Cart completion did not result in an order. Please try again.")
    }

    return cartRes.cart
  } catch (error: any) {
    console.error("[PlaceOrder] Error completing cart:", error?.message, error?.status)
    // Handle 409 Conflict - cart already being completed
    if (
      error?.message?.includes("409") ||
      error?.message?.includes("conflict") ||
      error?.message?.includes("already being completed") ||
      error?.status === 409
    ) {
      console.log("[PlaceOrder] 409 Conflict detected, waiting for completion...")

      // Wait for the other process to finish (with exponential backoff)
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Try to retrieve the order (only for authenticated users)
      try {
        const orderHeaders = await getAuthHeaders()
        // Only try to get orders if we have auth headers (user is logged in)
        if (orderHeaders && Object.keys(orderHeaders).length > 0) {
          const orders = await sdk.store.order.list(
            { limit: 5, order: "-created_at", fields: "+email" } as any,
            orderHeaders
          )

          if (orders?.orders && orders.orders.length > 0) {
            const recentOrder = orders.orders[0]
            const isRecent = (Date.now() - new Date(recentOrder.created_at).getTime()) < 300000 // 5 min

            if (isRecent) {
              console.log("[PlaceOrder] Found order after 409:", recentOrder.id)
              const countryCode = recentOrder.shipping_address?.country_code?.toLowerCase()
              const orderCacheTag = await getCacheTag("orders")
              revalidateTag(orderCacheTag)
              removeCartId()
              redirect(`/${countryCode}/order/${recentOrder.id}/confirmed`)
              return
            }
          }
        }
      } catch (e) {
        console.log("[PlaceOrder] Could not retrieve order after 409:", e)
      }

      // If we can't find the order, handle based on auth status
      try {
        const orderHeaders = await getAuthHeaders()
        if (orderHeaders && Object.keys(orderHeaders).length > 0) {
          // Logged in user - redirect to orders page
          redirect("/account/orders")
        } else {
          // Guest user - redirect to home with success message
          removeCartId()
          redirect("/?order=completed")
        }
      } catch {
        // Fallback - redirect to home
        removeCartId()
        redirect("/?order=completed")
      }
      return
    }

    // Re-throw other errors
    throw medusaError(error)
  }
}

/**
 * Updates the countrycode param and revalidates the regions cache
 * @param regionId
 * @param countryCode
 */
export async function updateRegion(countryCode: string, currentPath: string) {
  const cartId = await getCartId()
  const region = await getRegion(countryCode)

  if (!region) {
    throw new Error(`Region not found for country code: ${countryCode}`)
  }

  if (cartId) {
    await updateCart({ region_id: region.id })
    const cartCacheTag = await getCacheTag("carts")
    revalidateTag(cartCacheTag)
  }

  const regionCacheTag = await getCacheTag("regions")
  revalidateTag(regionCacheTag)

  const productsCacheTag = await getCacheTag("products")
  revalidateTag(productsCacheTag)

  redirect(`/${countryCode}${currentPath}`)
}

export async function listCartOptions() {
  const cartId = await getCartId()
  const headers = {
    ...(await getAuthHeaders()),
  }
  const next = {
    ...(await getCacheOptions("shippingOptions")),
  }

  return await sdk.client.fetch<{
    shipping_options: HttpTypes.StoreCartShippingOption[]
  }>("/store/shipping-options", {
    query: { cart_id: cartId },
    next,
    headers,
    cache: "force-cache",
  })
}
