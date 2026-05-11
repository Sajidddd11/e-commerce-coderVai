import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import ReviewModuleService from "../../../../modules/review/service"
import { REVIEW_MODULE } from "../../../../modules/review"

/**
 * GET /admin/reviews/:review_id
 * Get a single review
 */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
    try {
        const { review_id } = req.params

        const reviewService: ReviewModuleService = req.scope.resolve(REVIEW_MODULE)

        const review = await reviewService.retrieveProductReview(review_id)

        return res.json({ review })
    } catch (error: any) {
        return res.status(500).json({
            message: error?.message || "Failed to fetch review",
        })
    }
}

/**
 * PUT /admin/reviews/:review_id
 * Update review (approve, add admin response, etc.)
 */
export const PUT = async (req: MedusaRequest, res: MedusaResponse) => {
    try {
        const { review_id } = req.params
        const updateData = req.body as any

        const reviewService: ReviewModuleService = req.scope.resolve(REVIEW_MODULE)

        // If adding admin response, set timestamp
        if (updateData.admin_response) {
            updateData.admin_responded_at = new Date()
        }

        const updatedReview = await reviewService.updateProductReviews({
            id: review_id,
            ...updateData
        })

        return res.json({
            message: "Review updated successfully",
            review: updatedReview,
        })
    } catch (error: any) {
        return res.status(500).json({
            message: error?.message || "Failed to update review",
        })
    }
}

/**
 * DELETE /admin/reviews/:review_id
 * Delete a review
 */
export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
    try {
        const { review_id } = req.params

        const reviewService: ReviewModuleService = req.scope.resolve(REVIEW_MODULE)

        await reviewService.deleteProductReviews(review_id)

        return res.json({
            message: "Review deleted successfully",
        })
    } catch (error: any) {
        return res.status(500).json({
            message: error?.message || "Failed to delete review",
        })
    }
}
