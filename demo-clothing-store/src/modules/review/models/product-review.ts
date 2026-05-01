import { model } from "@medusajs/framework/utils"

const ProductReview = model.define("product_review", {
    id: model.id().primaryKey(),
    product_id: model.text(),
    variant_id: model.text().nullable(),
    customer_id: model.text().nullable(),
    order_id: model.text().nullable(), // Link to order for verified purchases
    customer_name: model.text(),
    customer_email: model.text(),
    rating: model.number(), // 1-5 stars
    title: model.text(),
    content: model.text(),
    images: model.json().nullable(), // Array of image URLs
    is_verified_purchase: model.boolean().default(false),
    is_approved: model.boolean().default(false), // For moderation
    helpful_count: model.number().default(0), // How many found this helpful
    not_helpful_count: model.number().default(0),
    admin_response: model.text().nullable(),
    admin_responded_at: model.dateTime().nullable(),
})

export default ProductReview
