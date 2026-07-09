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

        // Mark all unread customer messages as read in this session
        const unreadMessages = messages.filter(m => m.sender === "customer" && !m.is_read)
        if (unreadMessages.length > 0) {
            await Promise.all(
                unreadMessages.map(m => chatService.updateChatMessages({ id: m.id, is_read: true }))
            )
        }

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
    const { session_id, content } = req.body as {
        session_id: string
        content: string
    }

    if (!session_id || !content) {
        return res.status(400).json({ message: "session_id and content are required" })
    }

    try {
        const message = await chatService.createChatMessages({
            session_id,
            sender: "admin",
            content,
            is_read: true,
        })
        res.json({ message })
    } catch (error: any) {
        res.status(500).json({
            message: "Failed to send message",
            error: error.message,
        })
    }
}

export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
    const chatService: ChatModuleService = req.scope.resolve(CHAT_MODULE)
    const { session_id } = req.query as { session_id?: string }

    if (!session_id) {
        return res.status(400).json({ message: "session_id is required" })
    }

    try {
        // Find all messages for this session
        const messages = await chatService.listChatMessages({ session_id })
        
        // Delete each message
        if (messages.length > 0) {
            const ids = messages.map(m => m.id)
            await chatService.deleteChatMessages(ids)
        }

        res.json({ message: "Conversation history cleared successfully" })
    } catch (error: any) {
        res.status(500).json({
            message: "Failed to clear conversation history",
            error: error.message,
        })
    }
}
