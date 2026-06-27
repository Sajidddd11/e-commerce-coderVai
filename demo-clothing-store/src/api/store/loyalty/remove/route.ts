import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { updateCartWorkflow } from "@medusajs/medusa/core-flows"

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
    const customerId = (req as any).auth_context?.actor_id
    if (!customerId) {
        return res.status(401).json({ message: "Unauthorized" })
    }

    const { cart_id: cartId } = req.body as { cart_id: string }

    if (!cartId) {
        return res.status(400).json({ message: "Invalid parameters" })
    }

    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
    const promotionModuleService = req.scope.resolve(Modules.PROMOTION)

    try {
        // 1. Fetch Cart
        const { data: carts } = await query.graph({
            entity: "cart",
            fields: ["id", "promotions.code", "metadata", "customer_id"],
            filters: { id: cartId },
        })

        const cart: any = carts?.[0]
        if (!cart) {
            return res.status(444).json({ message: "Cart not found" })
        }

        if (cart.customer_id !== customerId) {
            return res.status(403).json({ message: "Forbidden" })
        }

        const promoCode = `LOYALTY-${cartId}`

        // 2. Build the new codes list first (remove loyalty code, keep all others)
        const existingCodes = (cart.promotions || []).map((p: any) => p.code).filter(Boolean) as string[]
        const newCodes = existingCodes.filter(c => c !== promoCode)

        console.log("[loyalty/remove] cart.promotions:", JSON.stringify(cart.promotions))
        console.log("[loyalty/remove] existingCodes:", existingCodes)
        console.log("[loyalty/remove] newCodes after removing loyalty:", newCodes)

        // Keep other metadata fields but reset loyalty ones to null
        const newMetadata = {
            ...cart.metadata,
            loyalty_points_to_redeem: null,
            loyalty_discount_amount: null,
        }

        // 3. Update cart FIRST (so Medusa re-applies remaining codes while loyalty still exists)
        const { result: updatedCart } = await updateCartWorkflow(req.scope).run({
            input: {
                id: cartId,
                promo_codes: newCodes,
                metadata: newMetadata,
            }
        })

        // 4. NOW delete the promotion entity (after cart no longer references it)
        const existingPromos = await promotionModuleService.listPromotions({ code: promoCode })
        if (existingPromos && existingPromos.length > 0) {
            await promotionModuleService.deletePromotions(existingPromos.map(p => p.id))
        }

        res.json({
            message: "Loyalty points removed successfully",
            cart: updatedCart,
        })
    } catch (error: any) {
        res.status(500).json({
            message: "Failed to remove loyalty points",
            error: error.message,
        })
    }
}
