import { model } from "@medusajs/framework/utils"

const LoyaltyHistory = model.define("loyalty_history", {
    id: model.id().primaryKey(),
    customer_id: model.text(),
    points: model.number(), // Positive for earn/adjust-up, negative for redeem/adjust-down
    type: model.enum(["earn", "redeem", "admin_adjustment", "refund"]),
    description: model.text().nullable(),
    order_id: model.text().nullable(),
})

export default LoyaltyHistory
