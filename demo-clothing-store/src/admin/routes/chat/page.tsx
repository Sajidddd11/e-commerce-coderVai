import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Heading, Button, Badge, Text, toast, Toaster } from "@medusajs/ui"
import { ChatBubbleLeftRight, Trash } from "@medusajs/icons"
import { useEffect, useState, useCallback, useRef } from "react"

type Conversation = {
    session_id: string
    customer_name: string | null
    customer_email: string | null
    last_message: string
    last_message_at: string
    unread_count: number
}

type ChatMessage = {
    id: string
    session_id: string
    sender: "customer" | "admin"
    content: string
    customer_name: string | null
    customer_email: string | null
    is_read: boolean
    created_at: string
}

function MessageContent({ content }: { content: any }) {
    try {
        const rawContent = typeof content === "string" ? content : JSON.stringify(content)
        const trimmed = rawContent.trim()
        if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
            const data = typeof content === "object" ? content : JSON.parse(trimmed)
            if (data && data.type === "product_inquiry") {
                const { productId, handle, title, thumbnail, message } = data
                const adminProductUrl = `/app/products/${productId}`

                return (
                    <div className="flex flex-col gap-2">
                        {message && <p className="whitespace-pre-wrap break-words leading-relaxed">{message}</p>}
                        
                        {/* Embedded Product Card inside Admin Chat */}
                        <div className="bg-ui-bg-subtle border border-ui-border-base rounded-xl p-2.5 flex flex-col gap-2 shadow-sm text-ui-fg-base mt-1 max-w-[280px] w-full select-none">
                            <div className="flex items-center gap-2.5">
                                {thumbnail ? (
                                    <img 
                                        src={thumbnail} 
                                        alt={title} 
                                        className="w-12 h-12 rounded-lg object-cover bg-ui-bg-base shrink-0 border border-ui-border-base" 
                                    />
                                ) : (
                                    <div className="w-12 h-12 rounded-lg bg-[#56aebf]/10 text-[#56aebf] flex items-center justify-center shrink-0">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                                        </svg>
                                    </div>
                                )}
                                <div className="flex-1 min-w-0 text-left">
                                    <h4 className="font-semibold text-xs text-ui-fg-base truncate leading-snug">{title}</h4>
                                    <p className="text-[10px] text-ui-fg-muted truncate">Product ID: {productId}</p>
                                </div>
                            </div>
                            
                            <a
                                href={adminProductUrl}
                                className="flex items-center justify-center gap-1 w-full py-1.5 px-3 bg-[#56aebf] hover:bg-[#458f9e] text-white font-semibold text-[10px] rounded-lg transition-colors text-center"
                            >
                                <span>Go to Product</span>
                                <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                                </svg>
                            </a>
                        </div>
                    </div>
                )
            }
        }
    } catch {}

    const rawContent = typeof content === "string" ? content : ""
    const productLinkRegex = /(https?:\/\/[^\s]+)?\/products\/([a-zA-Z0-9_-]+)/
    const match = rawContent.match(productLinkRegex)

    if (match) {
        const productUrl = match[0]
        const handle = match[2]
        const nameMatch = rawContent.match(/for "([^"]+)"/)
        const productName = nameMatch ? nameMatch[1] : handle.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
        const textBeforeLink = rawContent.split("Product Link:")[0].split("http")[0].trim()

        return (
            <div className="flex flex-col gap-2">
                {textBeforeLink && <p className="whitespace-pre-wrap break-words leading-relaxed">{textBeforeLink}</p>}
                
                <div className="bg-ui-bg-subtle border border-ui-border-base rounded-xl p-2.5 flex flex-col gap-2 shadow-sm text-ui-fg-base mt-1 max-w-[280px] w-full select-none">
                    <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-lg bg-[#56aebf]/10 text-[#56aebf] flex items-center justify-center shrink-0">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                            </svg>
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                            <h4 className="font-semibold text-xs text-ui-fg-base truncate leading-snug">{productName}</h4>
                            <p className="text-[10px] text-ui-fg-muted truncate">Bulk Inquiry Item</p>
                        </div>
                    </div>
                    <a
                        href={productUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-1 w-full py-1.5 px-3 bg-[#56aebf] hover:bg-[#458f9e] text-white font-semibold text-[10px] rounded-lg transition-colors text-center"
                    >
                        <span>View Storefront Product</span>
                        <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                        </svg>
                    </a>
                </div>
            </div>
        )
    }

    return <p className="whitespace-pre-wrap break-words leading-relaxed">{rawContent}</p>
}

function getMessagePreview(messageStr: string): string {
    try {
        const trimmed = messageStr.trim()
        if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
            const data = JSON.parse(trimmed)
            if (data && data.type === "product_inquiry") {
                return `Product Inquiry: ${data.title}`
            }
        }
    } catch {}
    return messageStr
}

const CustomerChatPage = () => {
    const [conversations, setConversations] = useState<Conversation[]>([])
    const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [inputText, setInputText] = useState("")
    
    const [loadingList, setLoadingList] = useState(true)
    const [sending, setSending] = useState(false)
    const [clearing, setClearing] = useState(false)

    const chatEndRef = useRef<HTMLDivElement>(null)

    // ── Fetch Conversations List ────────────────────────────────────────────────
    const fetchConversations = useCallback(async (silent = false) => {
        if (!silent) setLoadingList(true)
        try {
            const res = await fetch("/admin/chat/conversations", { credentials: "include" })
            if (res.ok) {
                const data = await res.json()
                setConversations(data.conversations || [])
            }
        } catch (err) {
            console.error("Error fetching conversations:", err)
        } finally {
            if (!silent) setLoadingList(false)
        }
    }, [])

    // ── Fetch Messages Thread ────────────────────────────────────────────────────
    const fetchMessages = useCallback(async (sessionId: string) => {
        try {
            const res = await fetch(`/admin/chat/messages?session_id=${sessionId}`, { credentials: "include" })
            if (res.ok) {
                const data = await res.json()
                setMessages(data.messages || [])
            }
        } catch (err) {
            console.error("Error fetching messages:", err)
        }
    }, [])

    // Initial load
    useEffect(() => {
        fetchConversations()
    }, [fetchConversations])

    // Poll conversations list every 5 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            fetchConversations(true)
        }, 5000)
        return () => clearInterval(interval)
    }, [fetchConversations])

    // Poll current active thread every 3 seconds
    useEffect(() => {
        if (!activeSessionId) return
        
        fetchMessages(activeSessionId) // Fetch immediately when active thread changes

        const interval = setInterval(() => {
            fetchMessages(activeSessionId)
        }, 3000)
        
        return () => clearInterval(interval)
    }, [activeSessionId, fetchMessages])

    // Auto-scroll chat thread to bottom
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    // ── Send Message ─────────────────────────────────────────────────────────────
    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!inputText.trim() || !activeSessionId || sending) return

        const textToSend = inputText.trim()
        setInputText("")
        setSending(true)

        try {
            const res = await fetch("/admin/chat/messages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    session_id: activeSessionId,
                    content: textToSend
                })
            })
            if (res.ok) {
                await fetchMessages(activeSessionId)
                fetchConversations(true) // update snippet/time
            } else {
                toast.error("Failed to send message")
            }
        } catch {
            toast.error("Error sending message")
        } finally {
            setSending(false)
        }
    }

    // ── Clear Conversation History ───────────────────────────────────────────────
    const handleClearHistory = async () => {
        if (!activeSessionId || clearing) return
        if (!confirm("Are you sure you want to clear chat history for both ends? This cannot be undone.")) return

        setClearing(true)
        try {
            const res = await fetch(`/admin/chat/messages?session_id=${activeSessionId}`, {
                method: "DELETE",
                credentials: "include"
            })
            if (res.ok) {
                toast.success("Chat history cleared")
                setMessages([])
                setActiveSessionId(null)
                await fetchConversations()
            } else {
                toast.error("Failed to clear chat history")
            }
        } catch {
            toast.error("Error clearing chat history")
        } finally {
            setClearing(false)
        }
    }

    // Find active customer info
    const activeConv = conversations.find(c => c.session_id === activeSessionId)
    const displayName = activeConv?.customer_name || activeConv?.customer_email || `Session ${activeSessionId?.substring(0, 8)}...`

    return (
        <div className="flex border border-ui-border-base rounded-xl overflow-hidden h-[calc(100vh-140px)] bg-ui-bg-base shadow-sm">
            {/* Conversations Sidebar (1/3 Width) */}
            <div className="w-1/3 border-r border-ui-border-base flex flex-col bg-ui-bg-subtle/30">
                <div className="p-4 border-b border-ui-border-base bg-ui-bg-base">
                    <Heading level="h2" className="flex items-center gap-2">
                        <ChatBubbleLeftRight className="text-[#56aebf]" /> Conversations
                    </Heading>
                </div>
                
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {loadingList && conversations.length === 0 ? (
                        <div className="flex items-center justify-center h-32">
                            <p className="text-xs text-ui-fg-muted animate-pulse">Loading conversations...</p>
                        </div>
                    ) : conversations.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-48 text-center px-4">
                            <ChatBubbleLeftRight className="h-10 w-10 text-ui-fg-muted/40 mb-2" />
                            <p className="text-sm font-medium text-ui-fg-subtle">No active chats yet</p>
                            <p className="text-xs text-ui-fg-muted mt-1">Chats from storefront will appear here</p>
                        </div>
                    ) : (
                        conversations.map((conv) => {
                            const isActive = conv.session_id === activeSessionId
                            const isUnread = conv.unread_count > 0
                            const formattedTime = new Date(conv.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

                            return (
                                <button
                                    key={conv.session_id}
                                    onClick={() => {
                                        setActiveSessionId(conv.session_id)
                                        // Clear unread count locally instantly
                                        setConversations(prev => prev.map(c => c.session_id === conv.session_id ? { ...c, unread_count: 0 } : c))
                                    }}
                                    className={`w-full text-left p-3 rounded-lg flex flex-col gap-1 transition-all border ${
                                        isActive
                                            ? "bg-[#56aebf]/10 border-[#56aebf]/30 shadow-sm"
                                            : "border-transparent hover:bg-ui-bg-subtle hover:border-ui-border-base"
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className={`text-sm truncate max-w-[70%] ${isUnread ? "font-bold text-ui-fg-base" : "font-medium text-ui-fg-base"}`}>
                                            {conv.customer_email || conv.customer_name || `User ${conv.session_id.substring(0, 8)}`}
                                        </span>
                                        <span className="text-[10px] text-ui-fg-muted font-mono">
                                            {formattedTime}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <p className={`text-xs truncate max-w-[85%] ${isUnread ? "text-ui-fg-base font-medium" : "text-ui-fg-muted"}`}>
                                            {getMessagePreview(conv.last_message)}
                                        </p>
                                        {isUnread && (
                                            <Badge color="red" size="small" className="rounded-full px-1.5 min-w-[18px] text-center">
                                                {conv.unread_count}
                                            </Badge>
                                        )}
                                    </div>
                                </button>
                            )
                        })
                    )}
                </div>
            </div>

            {/* Chat Thread Panel (2/3 Width) */}
            <div className="flex-1 flex flex-col bg-ui-bg-base">
                {activeSessionId ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 border-b border-ui-border-base flex items-center justify-between bg-ui-bg-subtle/10">
                            <div>
                                <Heading level="h2" className="text-sm font-semibold">{displayName}</Heading>
                                {activeConv?.customer_name && activeConv?.customer_email && (
                                    <Text className="text-[10px] text-ui-fg-muted mt-0.5">{activeConv.customer_name} ({activeConv.customer_email})</Text>
                                )}
                            </div>
                            <Button
                                size="small"
                                variant="danger"
                                onClick={handleClearHistory}
                                disabled={clearing}
                                className="flex items-center gap-1.5"
                            >
                                <Trash /> Clear History
                            </Button>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-ui-bg-base">
                            {messages.map((msg) => {
                                const isAdmin = msg.sender === "admin"
                                return (
                                    <div
                                        key={msg.id}
                                        className={`flex flex-col ${isAdmin ? "items-end" : "items-start"}`}
                                    >
                                        <div
                                            className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                                                isAdmin
                                                    ? "bg-[#56aebf] text-white rounded-tr-none"
                                                    : "bg-ui-bg-subtle text-ui-fg-base border border-ui-border-base rounded-tl-none"
                                            }`}
                                        >
                                            <MessageContent content={msg.content} />
                                        </div>
                                        <span className="text-[9px] text-ui-fg-muted font-mono mt-1 px-1">
                                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                )
                            })}
                            <div ref={chatEndRef} />
                        </div>

                        {/* Input Area */}
                        <form onSubmit={handleSendMessage} className="p-3 border-t border-ui-border-base flex gap-2 bg-ui-bg-subtle/10">
                            <input
                                type="text"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                placeholder="Type a message to reply..."
                                className="flex-1 h-9 px-3 border border-ui-border-base rounded-md text-sm bg-ui-bg-base text-ui-fg-base focus:outline-none focus:ring-1 focus:ring-[#56aebf] focus:border-[#56aebf] transition-all"
                                disabled={sending}
                            />
                            <button
                                type="submit"
                                disabled={!inputText.trim() || sending}
                                className="h-9 px-4 rounded-md text-xs font-semibold text-white bg-[#56aebf] hover:bg-[#458f9e] transition-colors disabled:opacity-50"
                            >
                                {sending ? "Sending..." : "Send"}
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-ui-bg-subtle/5">
                        <ChatBubbleLeftRight className="h-16 w-16 text-ui-fg-muted/30 mb-4" />
                        <Heading level="h2" className="text-ui-fg-subtle">Select a conversation</Heading>
                        <p className="text-sm text-ui-fg-muted mt-1 max-w-xs">
                            Choose a customer chat from the list on the left to start messaging.
                        </p>
                    </div>
                )}
            </div>
            <Toaster />
        </div>
    )
}

export const config = defineRouteConfig({
    label: "Customer Chat",
    icon: ChatBubbleLeftRight,
})

export default CustomerChatPage
