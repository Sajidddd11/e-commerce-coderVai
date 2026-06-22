import { model } from "@medusajs/framework/utils"

/**
 * ProductCooccurrence — stores how often pairs of products appear in the same order.
 *
 * Built nightly by the rebuild-cooccurrence job which scans completed orders.
 * Powers Strategy 2: "Frequently Bought Together" recommendations.
 *
 * Example row: { product_a_id: "prod_shirt", product_b_id: "prod_belt", count: 147 }
 * Meaning: 147 orders contained both the shirt and the belt.
 */
const ProductCooccurrence = model.define("product_cooccurrence", {
    id: model.id().primaryKey(),
    /** First product in the pair */
    product_a_id: model.text(),
    /** Second product in the pair */
    product_b_id: model.text(),
    /** Number of orders where both products appeared together */
    count: model.number().default(1),
})

export default ProductCooccurrence
