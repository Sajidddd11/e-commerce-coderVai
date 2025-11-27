import { MedusaNextFunction, MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

/**
 * Middleware to enrich payment session creation with cart data
 * This ensures payment providers get access to billing/shipping addresses
 */
export async function enrichPaymentContext(
  req: MedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction
) {
  // Only apply to payment session creation
  if (req.method !== "POST" || !req.url?.includes("/payment-sessions")) {
    return next()
  }

  try {
    const body = req.body as any
    const paymentCollectionId = req.params.id || body?.payment_collection_id

    if (!paymentCollectionId) {
      return next()
    }

    //Get modules
    const paymentModule = req.scope.resolve(Modules.PAYMENT)
    const cartModule = req.scope.resolve(Modules.CART)
    const linkModule = req.scope.resolve("remoteLink")

    // Get cart_id from payment_collection via link
    const links = await linkModule.list({
      payment_collection_id: paymentCollectionId,
    })

    if (!links || links.length === 0) {
      return next()
    }

    const cartId = (links[0] as any).cart_id

    if (!cartId) {
      return next()
    }

    // Retrieve cart with addresses
    const cart = await cartModule.retrieveCart(cartId, {
      relations: ["billing_address", "shipping_address"],
    })

    if (cart) {
      // Inject cart data into the request body context
      if (!body.context) {
        body.context = {}
      }
      
      body.context.cart = {
        id: cart.id,
        email: cart.email,
        billing_address: cart.billing_address,
        shipping_address: cart.shipping_address,
      }

      console.log(`[Middleware] Enriched payment context with cart: ${cart.id}`)
    }
  } catch (error) {
    console.error("[Middleware] Failed to enrich payment context:", error)
    // Continue anyway - don't block payment
  }

  return next()
}

