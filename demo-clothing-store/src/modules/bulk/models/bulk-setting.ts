import { model } from "@medusajs/framework/utils"

const BulkSetting = model.define("bulk_setting", {
    key: model.text().primaryKey(),
    value: model.text(),
})

export default BulkSetting
