import { model } from "@medusajs/framework/utils"

const SmsLog = model.define("sms_log", {
  id: model.id().primaryKey(),
  recipient: model.text(),
  message: model.text(),
  sender_id: model.text().nullable(),
  sms_type: model.text().default("text"),
  status: model.enum(["pending", "sent", "failed", "delivered"]).default("pending"),
  response_code: model.number().nullable(),
  response_message: model.text().nullable(),
  raw_response: model.json().nullable(),
  order_id: model.text().nullable(),
  metadata: model.json().nullable(),
})

export default SmsLog

