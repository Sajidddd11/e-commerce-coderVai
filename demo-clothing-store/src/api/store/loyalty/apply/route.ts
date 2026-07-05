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
            fields: [
                "id", 
                "currency_code", 
                "subtotal", 
                "promotions.code", 
                "metadata", 
                "customer_id",
                "items.id",
                "items.quantity",
                "items.subtotal",
                "items.unit_price",
                "items.product_id",
                "items.product.metadata",
            ],
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

        const getNumericValue = (val: any): number => {
            if (val === undefined || val === null) return 0
            if (typeof val === "number") return val
            if (typeof val === "string") return parseFloat(val) || 0
            if (typeof val.numeric !== "undefined") return Number(val.numeric)
            if (typeof val.numeric_ !== "undefined") return Number(val.numeric_)
            if (val.raw_ && val.raw_.value) return parseFloat(val.raw_.value) || 0
            return Number(val) || 0
        }

        // 3. Calculate allowed points based on cart line items and product-specific limits
        let maxPointsNeeded = 0

        for (const item of cart.items || []) {
            const rawItemSubtotal = getNumericValue(item.subtotal)
            const itemSubtotalBDT = rawItemSubtotal > 0
                ? rawItemSubtotal
                : getNumericValue(item.unit_price) * item.quantity

            const itemMaxPointsDefault = itemSubtotalBDT * settings.points_per_bdt_discount

            // Check if metadata has max_usable_coins
            const maxUsableCoinsStr = item.product?.metadata?.max_usable_coins
            if (maxUsableCoinsStr !== undefined && maxUsableCoinsStr !== null && maxUsableCoinsStr !== "") {
                const maxUsableCoinsPerUnit = Number(maxUsableCoinsStr)
                if (!isNaN(maxUsableCoinsPerUnit) && maxUsableCoinsPerUnit >= 0) {
                    const itemLimit = maxUsableCoinsPerUnit * item.quantity
                    maxPointsNeeded += Math.min(itemLimit, itemMaxPointsDefault)
                    continue
                }
            }

            // If no limit is declared for this specific product, cap only by item subtotal
            maxPointsNeeded += itemMaxPointsDefault
        }

        // Cap the maximum points needed to the total cart subtotal in BDT
        // If cart.subtotal is 0 or empty, we dynamically calculate it from the sum of line items.
        const rawCartSubtotal = getNumericValue(cart.subtotal)
        const cartSubtotalBDT = rawCartSubtotal > 0 
            ? rawCartSubtotal 
            : (cart.items || []).reduce((sum: number, item: any) => {
                const rawItemSubtotal = getNumericValue(item.subtotal)
                const itemSubtotal = rawItemSubtotal > 0
                    ? rawItemSubtotal
                    : getNumericValue(item.unit_price) * item.quantity
                return sum + itemSubtotal
            }, 0)

        const totalCartMaxPoints = cartSubtotalBDT * settings.points_per_bdt_discount
        maxPointsNeeded = Math.min(maxPointsNeeded, totalCartMaxPoints)

        const allowedPoints = Math.min(points, maxPointsNeeded, account.points)

        // Ensure the discount is a round integer value in BDT
        const discountBDT = Math.floor(allowedPoints / settings.points_per_bdt_discount)
        const finalAllowedPoints = discountBDT * settings.points_per_bdt_discount
        const discountMinor = discountBDT * 100

        console.log("[Loyalty Apply] Diagnostics:", {
            cartId,
            points,
            accountPoints: account.points,
            cartSubtotal: cart.subtotal,
            cartSubtotalBDT,
            maxPointsNeeded,
            allowedPoints,
            discountBDT,
            finalAllowedPoints,
            items: cart.items?.map((item: any) => ({
                id: item.id,
                subtotal: getNumericValue(item.subtotal),
                unitPrice: getNumericValue(item.unit_price),
                quantity: item.quantity,
                productId: item.product_id,
                metadata: item.product?.metadata,
            }))
        })

        if (finalAllowedPoints <= 0) {
            return res.status(400).json({ 
                message: "Points amount too small to generate a whole discount amount",
                diagnostics: {
                    points,
                    account_points: account.points,
                    cart_subtotal: cart.subtotal,
                    cart_subtotal_bdt: cartSubtotalBDT,
                    max_points_needed: maxPointsNeeded,
                    allowed_points: allowedPoints,
                    discount_bdt: discountBDT,
                    final_allowed_points: finalAllowedPoints,
                }
            })
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
        const existingCodes = (cart.promotions || []).map((p: any) => p.code).filter(Boolean) as string[]
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
