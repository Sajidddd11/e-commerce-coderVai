import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { REVIEW_MODULE } from "~/modules/review"
import type ReviewModuleService from "~/modules/review/service"
import { Modules } from "@medusajs/framework/utils"

/**
 * GET /store/reviews/me
 *
 * Returns a list of unique product IDs that the currently logged-in
 * customer has already reviewed.
 */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
    try {
        const customerId: string | undefined = (req as any).auth_context?.actor_id

        console.log("[reviews/me] GET request received for customerId:", customerId)

        if (!customerId) {
            console.log("[reviews/me] No customerId found in auth context")
            return res.status(401).json({ message: "Unauthorized" })
        }

        const reviewService: ReviewModuleService = req.scope.resolve(REVIEW_MODULE)
        const customerModuleService = req.scope.resolve(Modules.CUSTOMER) as any

        // Fetch customer email to find older reviews submitted without customer_id
        let customerEmail: string | undefined
        try {
            const customer = await customerModuleService.retrieveCustomer(customerId)
            customerEmail = customer?.email
            console.log("[reviews/me] Retrieved customer email:", customerEmail)
        } catch (err: any) {
            console.error("[reviews/me] Error retrieving customer:", err?.message || err)
        }

        // Fetch reviews by customer ID and email (in parallel)
        const [reviewsById, reviewsByEmail] = await Promise.all([
            reviewService.listProductReviews({ customer_id: customerId }),
            customerEmail
                ? reviewService.listProductReviews({ customer_email: customerEmail })
                : Promise.resolve([])
        ])

        console.log(
            `[reviews/me] Found ${reviewsById.length} reviews by ID and ${reviewsByEmail.length} reviews by Email`
        )

        // Merge and deduplicate product IDs
        const allReviews = [...reviewsById, ...reviewsByEmail]
        const reviewedProductIds = Array.from(
            new Set(allReviews.map((r) => r.product_id))
        )

        console.log("[reviews/me] Unique reviewed product IDs:", reviewedProductIds)

        return res.json({ reviewed_product_ids: reviewedProductIds })
    } catch (error: any) {
        console.error("[reviews/me] Unhandled error:", error)
        return res.status(500).json({
            message: error?.message || "Failed to fetch reviewed products",
        })
    }
}

