import { model } from "@medusajs/framework/utils"

const VariantBuyingPrice = model.define("variant_buying_price", {
    variant_id: model.text().primaryKey(),
    buying_price: model.number(),
})

export default VariantBuyingPrice
