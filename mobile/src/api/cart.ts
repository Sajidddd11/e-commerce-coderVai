import { HttpTypes } from "@medusajs/types"
import { sdk, MEDUSA_BACKEND, PUBLISHABLE_KEY } from "./sdk"
import { getRegion } from "./regions"
import { getAuthHeaders, storage, STORAGE_KEYS } from "@utils/storage"

/**
 * Ported from web src/lib/data/cart.ts.
 * Differences: cart id lives in AsyncStorage (not a cookie), no revalidateTag,
 * functions return data instead of calling Next.js redirect().
 */

const CART_FIELDS =
  "*items, *region, *items.product, *items.variant, *items.thumbnail, *items.metadata, +items.total, *promotions, +shipping_methods.name, *payment_collection, *payment_collection.payment_sessions, *shipping_address, *billing_address"

export async function getCartId(): Promise<string | null> {
  return storage.get(STORAGE_KEYS.cartId)
}

export async function setCartId(id: string): Promise<void> {
  await storage.set(STORAGE_KEYS.cartId, id)
}

export async function removeCartId(): Promise<void> {
  await storage.remove(STORAGE_KEYS.cartId)
}

export async function retrieveCart(
  cartId?: string
): Promise<HttpTypes.StoreCart | null> {
  const id = cartId || (await getCartId())
  if (!id) return null

  const headers = await getAuthHeaders()

  return sdk.client
    .fetch<{ cart: HttpTypes.StoreCart }>(`/store/carts/${id}`, {
      method: "GET",
      query: { fields: CART_FIELDS },
      headers,
    })
    .then(({ cart }) => cart)
    .catch(() => null)
}

export async function getOrSetCart(
  countryCode: string
): Promise<HttpTypes.StoreCart> {
  const region = await getRegion(countryCode)
  if (!region) {
    throw new Error(`Region not found for country code: ${countryCode}`)
  }

  const headers = await getAuthHeaders()
  let cart = await retrieveCart()

  if (!cart) {
    const { cart: newCart } = await sdk.store.cart.create(
      { region_id: region.id },
      {},
      headers
    )
    await setCartId(newCart.id)
    cart = await retrieveCart(newCart.id)
  }

  if (cart && cart.region_id !== region.id) {
    await sdk.store.cart.update(cart.id, { region_id: region.id }, {}, headers)
    cart = await retrieveCart(cart.id)
  }

  return cart as HttpTypes.StoreCart
}

export async function addToCart({
  variantId,
  quantity,
  countryCode,
}: {
  variantId: string
  quantity: number
  countryCode: string
}): Promise<HttpTypes.StoreCart | null> {
  if (!variantId) throw new Error("Missing variant ID when adding to cart")

  const cart = await getOrSetCart(countryCode)
  const headers = await getAuthHeaders()

  await sdk.store.cart.createLineItem(
    cart.id,
    { variant_id: variantId, quantity },
    {},
    headers
  )

  return retrieveCart(cart.id)
}

export async function updateLineItem({
  lineId,
  quantity,
}: {
  lineId: string
  quantity: number
}): Promise<HttpTypes.StoreCart | null> {
  const cartId = await getCartId()
  if (!cartId) throw new Error("Missing cart ID when updating line item")

  const headers = await getAuthHeaders()
  await sdk.store.cart.updateLineItem(cartId, lineId, { quantity }, {}, headers)

  return retrieveCart(cartId)
}

export async function deleteLineItem(
  lineId: string
): Promise<HttpTypes.StoreCart | null> {
  const cartId = await getCartId()
  if (!cartId) throw new Error("Missing cart ID when deleting line item")

  const headers = await getAuthHeaders()

  // The Medusa v2 SDK deleteLineItem returns a DeletedResponse, not the
  // updated cart. We ignore its return value and re-fetch the full cart.
  await sdk.store.cart.deleteLineItem(cartId, lineId, headers)

  return retrieveCart(cartId)
}

export async function applyPromotions(
  codes: string[]
): Promise<HttpTypes.StoreCart | null> {
  const cartId = await getCartId()
  if (!cartId) throw new Error("No existing cart found")

  const headers = await getAuthHeaders()
  await sdk.store.cart.update(cartId, { promo_codes: codes }, {}, headers)

  return retrieveCart(cartId)
}

export async function updateCart(
  data: HttpTypes.StoreUpdateCart
): Promise<HttpTypes.StoreCart | null> {
  const cartId = await getCartId()
  if (!cartId) {
    throw new Error("No existing cart found, please create one before updating")
  }

  const headers = await getAuthHeaders()
  await sdk.store.cart.update(cartId, data, {}, headers)

  return retrieveCart(cartId)
}

export async function setShippingMethod({
  cartId,
  shippingMethodId,
}: {
  cartId: string
  shippingMethodId: string
}): Promise<HttpTypes.StoreCart | null> {
  const headers = await getAuthHeaders()
  await sdk.store.cart.addShippingMethod(
    cartId,
    { option_id: shippingMethodId },
    {},
    headers
  )
  return retrieveCart(cartId)
}

/**
 * Initiate a payment session. Mirrors web initiatePaymentSession — always
 * enriches the request with a cart snapshot (SSLCommerz provider reads it).
 * Also injects `return_url` for mobile so the backend redirects back to the
 * app deep link instead of the web storefront after payment.
 */
export async function initiatePaymentSession(
  cart: HttpTypes.StoreCart,
  data: HttpTypes.StoreInitializePaymentSession,
  options?: { returnUrl?: string }
) {
  const headers = await getAuthHeaders()

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
      // Tell the backend where to redirect after SSLCommerz processes payment.
      // The backend stores this in session data and uses it in respondWithRedirect.
      ...(options?.returnUrl ? { return_url: options.returnUrl } : {}),
    },
  }

  return sdk.store.payment.initiatePaymentSession(cart, enrichedData, {}, headers)
}

/**
 * Complete the cart → order. Returns the completed order on success, or the
 * still-incomplete cart otherwise. Caller is responsible for clearing the cart
 * id and sending the confirmation SMS (matches web placeOrder split).
 */
export async function placeOrder(
  cartId?: string
): Promise<
  | { type: "order"; order: HttpTypes.StoreOrder }
  | { type: "cart"; cart: HttpTypes.StoreCart }
> {
  const id = cartId || (await getCartId())
  if (!id) throw new Error("No existing cart found when placing an order")

  const authHeaders = await getAuthHeaders()

  // Use native fetch with an explicit body to avoid React Native sending a
  // null-byte when the SDK makes a bodyless POST with Content-Type: application/json.
  // Sending `{}` (2 valid bytes) passes the backend's body-parser.
  const res = await fetch(`${MEDUSA_BACKEND}/store/carts/${id}/complete`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(PUBLISHABLE_KEY ? { "x-publishable-api-key": PUBLISHABLE_KEY } : {}),
      ...authHeaders,
    },
    body: JSON.stringify({}),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(`Cart complete failed (${res.status}): ${text}`)
  }

  const cartRes: {
    type: "order" | "cart"
    order: HttpTypes.StoreOrder
    cart: HttpTypes.StoreCart
  } = await res.json()

  if (cartRes?.type === "order") {
    return { type: "order", order: cartRes.order }
  }
  return { type: "cart", cart: cartRes.cart }
}

/** Sum of line item quantities — used for the tab bar badge. */
export function getCartItemCount(cart: HttpTypes.StoreCart | null): number {
  if (!cart?.items?.length) return 0
  return cart.items.reduce((acc, item) => acc + (item.quantity ?? 0), 0)
}
