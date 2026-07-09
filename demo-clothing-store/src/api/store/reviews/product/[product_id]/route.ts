import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
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
 * Create a new review for a product.
 *
 * REQUIREMENT: The authenticated customer must have a delivered or refunded
 * order that contains this product. The order_id is required and verified.
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
            customer_id: bodyCustomerId,
            order_id,
            variant_id,
            images,
        } = req.body as any

        // ── Auth ──────────────────────────────────────────────────────────────
        const customerId: string | undefined = (req as any).auth_context?.actor_id
        if (!customerId) {
            return res.status(401).json({ message: "You must be logged in to submit a review." })
        }

        // ── Validate basic fields ─────────────────────────────────────────────
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ message: "Rating must be between 1 and 5" })
        }
        if (!title || !content) {
            return res.status(400).json({ message: "Title and content are required" })
        }
        if (!customer_name || !customer_email) {
            return res.status(400).json({ message: "Customer name and email are required" })
        }

        // ── Require order_id ──────────────────────────────────────────────────
        if (!order_id) {
            return res.status(400).json({
                message: "Reviews can only be submitted for orders you have placed.",
            })
        }

        // ── Verify the order belongs to this customer and has eligible status ─
        const orderModuleService = req.scope.resolve(Modules.ORDER)
        const ELIGIBLE_STATUSES = ["delivered", "refunded"]

        let order: any = null
        try {
            order = await orderModuleService.retrieveOrder(order_id, {
                relations: ["items"],
            } as any)
        } catch {
            return res.status(404).json({ message: "Order not found." })
        }

        if (!order || order.customer_id !== customerId) {
            return res.status(403).json({ message: "This order does not belong to your account." })
        }

        const orderStatus: string = order.metadata?.custom_status || order.status || ""
        if (!ELIGIBLE_STATUSES.includes(orderStatus)) {
            return res.status(403).json({
                message: "Reviews can only be submitted for delivered or refunded orders.",
            })
        }

        // ── Verify the order contains this product ────────────────────────────
        const items: any[] = order.items ?? []
        const containsProduct = items.some(
            (item: any) =>
                item.product_id === product_id ||
                item.variant?.product_id === product_id
        )
        if (!containsProduct) {
            return res.status(403).json({
                message: "This product is not part of the specified order.",
            })
        }

        // ── Check for duplicate review ────────────────────────────────────────
        const reviewService: ReviewModuleService = req.scope.resolve(REVIEW_MODULE)
        const hasReviewed = await reviewService.hasCustomerReviewed(product_id, customer_email)
        if (hasReviewed) {
            return res.status(400).json({ message: "You have already reviewed this product." })
        }

        // ── Create review ─────────────────────────────────────────────────────
        const review = await reviewService.createProductReviews({
            product_id,
            variant_id: variant_id || null,
            customer_id: customerId,
            order_id,
            customer_name,
            customer_email,
            rating: Number(rating),
            title,
            content,
            images: images || null,
            is_verified_purchase: true, // always true now — we verified the order above
            is_approved: false,
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
