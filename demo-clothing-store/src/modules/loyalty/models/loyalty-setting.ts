import { model } from "@medusajs/framework/utils"

const LoyaltySetting = model.define("loyalty_setting", {
    key: model.text().primaryKey(),
    value: model.text(),
})

export default LoyaltySetting
