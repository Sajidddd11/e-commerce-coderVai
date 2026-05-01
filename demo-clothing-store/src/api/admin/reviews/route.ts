import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import ReviewModuleService from "../../../modules/review/service"
import { REVIEW_MODULE } from "../../../modules/review"

/**
 * GET /admin/reviews
 * Get all reviews (approved and pending)
 */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
    try {
        const {
            page = 1,
            limit = 20,
            is_approved,
            product_id,
            rating,
        } = req.query

        const reviewService: ReviewModuleService = req.scope.resolve(REVIEW_MODULE)

        const filters: any = {}

        if (is_approved !== undefined) {
            filters.is_approved = is_approved === 'true'
        }

        if (product_id) {
            filters.product_id = product_id
        }

        if (rating) {
            filters.rating = Number(rating)
        }

        const skip = (Number(page) - 1) * Number(limit)
        const take = Number(limit)

        const [reviews, totalCount] = await reviewService.listAndCountProductReviews(
            filters,
            {
                skip,
                take,
                order: { created_at: 'DESC' },
            }
        )
 
        return res.json({
            reviews,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total: totalCount,
                pages: Math.ceil(totalCount / Number(limit)),
            },
        })
    } catch (error: any) {
        return res.status(500).json({
            message: error?.message || "Failed to fetch reviews",
        })
    }
}
