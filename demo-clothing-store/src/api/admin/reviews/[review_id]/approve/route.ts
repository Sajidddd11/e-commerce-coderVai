import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import ReviewModuleService from "../../../../../modules/review/service"
import { REVIEW_MODULE } from "../../../../../modules/review"

/**
 * POST /admin/reviews/:review_id/approve
 * Approve a review
 */
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
    try {
        const { review_id } = req.params

        const reviewService: ReviewModuleService = req.scope.resolve(REVIEW_MODULE)

        const updatedReview = await reviewService.updateProductReviews({
            id: review_id,
            is_approved: true,
        })

        return res.json({
            message: "Review approved successfully",
            review: updatedReview,
        })
    } catch (error: any) {
        return res.status(500).json({
            message: error?.message || "Failed to approve review",
        })
    }
}
