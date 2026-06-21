import { model } from "@medusajs/framework/utils"

const BulkProduct = model.define("bulk_product", {
    id: model.id().primaryKey(),
    product_id: model.text(),
    is_active: model.boolean().default(true),
    min_quantity: model.number().nullable(),
    notes: model.text().nullable(),
})

export default BulkProduct
