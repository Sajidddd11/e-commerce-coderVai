import { model } from "@medusajs/framework/utils"

const ChatMessage = model.define("chat_message", {
    id: model.id().primaryKey(),
    session_id: model.text().index(),
    sender: model.text(), // "customer" | "admin"
    content: model.text(),
    customer_name: model.text().nullable(),
    customer_email: model.text().nullable(),
    is_read: model.boolean().default(false),
})

export default ChatMessage
