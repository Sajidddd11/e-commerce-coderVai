import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { CHAT_MODULE } from "../../../../modules/chat"
import type ChatModuleService from "../../../../modules/chat/service"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
    const chatService: ChatModuleService = req.scope.resolve(CHAT_MODULE)
    const { session_id } = req.query as { session_id?: string }

    if (!session_id) {
        return res.status(400).json({ message: "session_id is required" })
    }

    try {
        const messages = await chatService.listChatMessages(
            { session_id },
            { order: { created_at: "ASC" } }
        )
        res.json({ messages })
    } catch (error: any) {
        res.status(500).json({
            message: "Failed to fetch messages",
            error: error.message,
        })
    }
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
    const chatService: ChatModuleService = req.scope.resolve(CHAT_MODULE)
    const { session_id, content, customer_name, customer_email } = req.body as {
        session_id: string
        content: string
        customer_name?: string
        customer_email?: string
    }

    if (!session_id || !content) {
        return res.status(400).json({ message: "session_id and content are required" })
    }

    try {
        const message = await chatService.createChatMessages({
            session_id,
            sender: "customer",
            content,
            customer_name: customer_name || null,
            customer_email: customer_email || null,
            is_read: false,
        })
        res.json({ message })
    } catch (error: any) {
        res.status(500).json({
            message: "Failed to send message",
            error: error.message,
        })
    }
}
