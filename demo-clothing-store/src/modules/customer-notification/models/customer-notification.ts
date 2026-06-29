import { model } from "@medusajs/framework/utils"

const CustomerNotification = model.define("customer_notification", {
  id: model.id().primaryKey(),
  customer_id: model.text(),
  title: model.text(),
  message: model.text(),
  order_id: model.text().nullable(),
  type: model.text().default("general"),
  status: model.enum(["unread", "read"]).default("unread"),
})

export default CustomerNotification
