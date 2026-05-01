import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import ReviewModuleService from "../../../../../modules/review/service"
import { REVIEW_MODULE } from "../../../../../modules/review"

/**
 * POST /store/reviews/:review_id/helpful
 * Mark a review as helpful or not helpful
 */
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
    try {
        const { review_id } = req.params
        const { is_helpful } = req.body as { is_helpful: boolean }

        if (typeof is_helpful !== 'boolean') {
            return res.status(400).json({
                message: "is_helpful must be a boolean value",
            })
        }

        const reviewService: ReviewModuleService = req.scope.resolve(REVIEW_MODULE)

        const updatedReview = await reviewService.markReviewHelpful(
            review_id,
            is_helpful
        )

        return res.json({
            message: "Thank you for your feedback",
            review: updatedReview,
        })
    } catch (error: any) {
        return res.status(500).json({
            message: error?.message || "Failed to mark review as helpful",
        })
    }
}
