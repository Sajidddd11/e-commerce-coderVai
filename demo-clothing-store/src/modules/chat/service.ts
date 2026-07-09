import { MedusaService } from "@medusajs/framework/utils"
import ChatMessage from "./models/chat-message"

class ChatModuleService extends MedusaService({
    ChatMessage,
}) {}

export default ChatModuleService
