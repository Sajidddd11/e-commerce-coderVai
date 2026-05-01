import { MedusaService } from "@medusajs/framework/utils"
import ProductReview from "./models/product-review"

class ReviewModuleService extends MedusaService({
    ProductReview,
}) {
    /**
     * Get average rating for a product
     */
    async getProductAverageRating(productId: string) {
        const reviews = await this.listProductReviews({
            product_id: productId,
            is_approved: true,
        })

        if (reviews.length === 0) {
            return {
                average: 0,
                count: 0,
                distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
            }
        }

        const total = reviews.reduce((sum, review) => sum + review.rating, 0)
        const average = total / reviews.length

        // Calculate rating distribution
        const distribution = reviews.reduce((dist, review) => {
            dist[review.rating] = (dist[review.rating] || 0) + 1
            return dist
        }, {} as Record<number, number>)

        // Ensure all ratings 1-5 exist
        for (let i = 1; i <= 5; i++) {
            if (!distribution[i]) distribution[i] = 0
        }

        return {
            average: Math.round(average * 10) / 10, // Round to 1 decimal
            count: reviews.length,
            distribution,
        }
    }

    /**
     * Get reviews for a product with pagination
     */
    async getProductReviews(productId: string, options: {
        skip?: number
        take?: number
        sortBy?: 'recent' | 'helpful' | 'rating_high' | 'rating_low'
    } = {}) {
        const { skip = 0, take = 10, sortBy = 'recent' } = options

        let order: any = { created_at: 'DESC' }

        switch (sortBy) {
            case 'helpful':
                order = { helpful_count: 'DESC' }
                break
            case 'rating_high':
                order = { rating: 'DESC' }
                break
            case 'rating_low':
                order = { rating: 'ASC' }
                break
        }

        return this.listProductReviews(
            {
                product_id: productId,
                is_approved: true,
            },
            {
                skip,
                take,
                order,
            }
        )
    }

    /**
     * Check if customer has already reviewed this product
     */
    async hasCustomerReviewed(productId: string, customerEmail: string) {
        const reviews = await this.listProductReviews({
            product_id: productId,
            customer_email: customerEmail,
        })
        return reviews.length > 0
    }

    /**
     * Mark review as helpful
     */
    async markReviewHelpful(reviewId: string, isHelpful: boolean) {
        const review = await this.retrieveProductReview(reviewId)
        
        if (isHelpful) {
            review.helpful_count = (review.helpful_count || 0) + 1
        } else {
            review.not_helpful_count = (review.not_helpful_count || 0) + 1
        }

        return this.updateProductReviews({
            id: reviewId,
            helpful_count: review.helpful_count,
            not_helpful_count: review.not_helpful_count,
        })
    }
}

export default ReviewModuleService
