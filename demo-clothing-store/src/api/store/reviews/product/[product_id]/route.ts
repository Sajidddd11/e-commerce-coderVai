import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import ReviewModuleService from "../../../../../modules/review/service"
import { REVIEW_MODULE } from "../../../../../modules/review"

/**
 * GET /store/reviews/product/:product_id
 * Get all approved reviews for a product with ratings summary
 */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
    try {
        const { product_id } = req.params
        const { page = 1, limit = 10, sortBy = 'recent' } = req.query

        const reviewService: ReviewModuleService = req.scope.resolve(REVIEW_MODULE)

        const skip = (Number(page) - 1) * Number(limit)
        const take = Number(limit)

        // Get reviews with pagination
        let reviews: any[] = []
        try {
            reviews = await reviewService.getProductReviews(product_id, {
                skip,
                take,
                sortBy: sortBy as any,
            })
        } catch (err) {
            // If no reviews yet, return empty array
            reviews = []
        }

        // Get rating summary
        const ratingSummary = await reviewService.getProductAverageRating(product_id)

        return res.json({
            reviews,
            rating_summary: ratingSummary,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total: ratingSummary.count,
                pages: Math.ceil(ratingSummary.count / Number(limit)),
            },
        })
    } catch (error: any) {
        return res.status(500).json({
            message: error?.message || "Failed to fetch product reviews",
        })
    }
}

/**
 * POST /store/reviews/product/:product_id
 * Create a new review for a product
 */
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
    try {
        const { product_id } = req.params
        const {
            rating,
            title,
            content,
            customer_name,
            customer_email,
            customer_id,
            order_id,
            variant_id,
            images,
        } = req.body as any

        // Validation
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ message: "Rating must be between 1 and 5" })
        }

        if (!title || !content) {
            return res.status(400).json({ message: "Title and content are required" })
        }

        if (!customer_name || !customer_email) {
            return res.status(400).json({ message: "Customer name and email are required" })
        }

        const reviewService: ReviewModuleService = req.scope.resolve(REVIEW_MODULE)

        // Check if customer already reviewed this product
        const hasReviewed = await reviewService.hasCustomerReviewed(
            product_id,
            customer_email
        )

        if (hasReviewed) {
            return res.status(400).json({
                message: "You have already reviewed this product",
            })
        }

        // Check if this is a verified purchase
        let isVerifiedPurchase = false
        if (order_id) {
            // You can add logic here to verify if the order exists and contains this product
            // For now, we'll trust the order_id if provided
            isVerifiedPurchase = true
        }

        // Create review (default: not approved, requires admin approval)
        const review = await reviewService.createProductReviews({
            product_id,
            variant_id: variant_id || null,
            customer_id: customer_id || null,
            order_id: order_id || null,
            customer_name,
            customer_email,
            rating: Number(rating),
            title,
            content,
            images: images || null,
            is_verified_purchase: isVerifiedPurchase,
            is_approved: false, // Requires admin approval
            helpful_count: 0,
            not_helpful_count: 0,
        })

        return res.status(201).json({
            message: "Review submitted successfully. It will appear after admin approval.",
            review,
        })
    } catch (error: any) {
        return res.status(500).json({
            message: error?.message || "Failed to create review",
        })
    }
}
