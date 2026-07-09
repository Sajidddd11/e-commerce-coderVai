import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { CHAT_MODULE } from "../../../../modules/chat"
import type ChatModuleService from "../../../../modules/chat/service"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
    const chatService: ChatModuleService = req.scope.resolve(CHAT_MODULE)

    try {
        // Fetch all messages sorted by created_at DESC to easily group them
        const messages = await chatService.listChatMessages(
            {},
            { order: { created_at: "DESC" } }
        )

        const conversationsMap: Record<string, {
            session_id: string
            customer_name: string | null
            customer_email: string | null
            last_message: string
            last_message_at: string
            unread_count: number
        }> = {}

        for (const msg of messages) {
            const sId = msg.session_id
            if (!conversationsMap[sId]) {
                conversationsMap[sId] = {
                    session_id: sId,
                    customer_name: msg.customer_name || null,
                    customer_email: msg.customer_email || null,
                    last_message: msg.content,
                    last_message_at: msg.created_at.toString(),
                    unread_count: 0
                }
            } else {
                // Keep customer details up to date
                if (!conversationsMap[sId].customer_name && msg.customer_name) {
                    conversationsMap[sId].customer_name = msg.customer_name
                }
                if (!conversationsMap[sId].customer_email && msg.customer_email) {
                    conversationsMap[sId].customer_email = msg.customer_email
                }
            }

            // Count unread customer messages
            if (msg.sender === "customer" && !msg.is_read) {
                conversationsMap[sId].unread_count += 1
            }
        }

        // Convert map to array and sort by last_message_at DESC
        const conversations = Object.values(conversationsMap).sort(
            (a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()
        )

        res.json({ conversations })
    } catch (error: any) {
        res.status(500).json({
            message: "Failed to fetch conversations",
            error: error.message,
        })
    }
}
