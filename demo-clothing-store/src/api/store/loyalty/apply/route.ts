import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { LOYALTY_MODULE } from "../../../../modules/loyalty"
import type LoyaltyModuleService from "../../../../modules/loyalty/service"
import { updateCartWorkflow } from "@medusajs/medusa/core-flows"

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
    const customerId = (req as any).auth_context?.actor_id
    if (!customerId) {
        return res.status(401).json({ message: "Unauthorized" })
    }

    const { cart_id: cartId, points } = req.body as { cart_id: string; points: number }

    if (!cartId || points === undefined || isNaN(points) || points <= 0) {
        return res.status(400).json({ message: "Invalid parameters" })
    }

    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
    const loyaltyService: LoyaltyModuleService = req.scope.resolve(LOYALTY_MODULE)
    const promotionModuleService = req.scope.resolve(Modules.PROMOTION)

    try {
        // 1. Fetch Cart
        const { data: carts } = await query.graph({
            entity: "cart",
            fields: ["id", "currency_code", "subtotal", "promo_codes", "metadata", "customer_id"],
            filters: { id: cartId },
        })

        const cart: any = carts?.[0]
        if (!cart) {
            return res.status(444).json({ message: "Cart not found" })
        }

        if (cart.customer_id !== customerId) {
            return res.status(403).json({ message: "Forbidden: Cart does not belong to you" })
        }

        // 2. Fetch Customer Loyalty Account and Settings
        const account = await loyaltyService.getOrCreateAccount(customerId)
        if (account.points < points) {
            return res.status(400).json({ message: "Insufficient points balance" })
        }

        const settings = await loyaltyService.getSettings()

        // 3. Calculate allowed points based on cart subtotal
        // We cap the discount to cart.subtotal.
        // Let's first calculate max allowed discount in BDT, then in minor units.
        const cartSubtotalBDT = Number(cart.subtotal || 0)
        // Cap the BDT discount to the floor of the subtotal (whole currency unit)
        const maxDiscountBDT = Math.floor(cartSubtotalBDT)
        const maxPointsNeeded = maxDiscountBDT * settings.points_per_bdt_discount
        const allowedPoints = Math.min(points, maxPointsNeeded, account.points)

        // Ensure the discount is a round integer value in BDT
        const discountBDT = Math.floor(allowedPoints / settings.points_per_bdt_discount)
        const finalAllowedPoints = discountBDT * settings.points_per_bdt_discount
        const discountMinor = discountBDT * 100

        if (finalAllowedPoints <= 0) {
            return res.status(400).json({ message: "Points amount too small to generate a whole discount amount" })
        }

        // 4. Create/Recreate the Promotion for this Cart
        const promoCode = `LOYALTY-${cartId}`
        const existingPromos = await promotionModuleService.listPromotions({ code: promoCode })
        if (existingPromos && existingPromos.length > 0) {
            await promotionModuleService.deletePromotions(existingPromos.map(p => p.id))
        }

        await promotionModuleService.createPromotions({
            code: promoCode,
            type: "standard",
            is_automatic: false,
            status: "active",
            application_method: {
                type: "fixed",
                value: discountBDT,
                currency_code: cart.currency_code,
                target_type: "items",
                allocation: "across",
            }
        })

        // 5. Update Cart with the new promo code and metadata
        const existingCodes = (cart.promo_codes || []) as string[]
        const newCodes = existingCodes.filter(c => c !== promoCode)
        newCodes.push(promoCode)

        const { result: updatedCart } = await updateCartWorkflow(req.scope).run({
            input: {
                id: cartId,
                promo_codes: newCodes,
                metadata: {
                    ...cart.metadata,
                    loyalty_points_to_redeem: finalAllowedPoints,
                    loyalty_discount_amount: discountMinor,
                }
            }
        })

        res.json({
            message: "Loyalty points applied successfully",
            cart: updatedCart,
            appliedPoints: finalAllowedPoints,
            discountAmount: discountMinor,
        })
    } catch (error: any) {
        res.status(500).json({
            message: "Failed to apply loyalty points",
            error: error.message,
        })
    }
}
