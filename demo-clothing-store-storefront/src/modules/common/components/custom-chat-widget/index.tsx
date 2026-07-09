"use client"

import { retrieveCustomer } from "@lib/data/customer"
import { getFingerprint } from "@lib/fingerprint"
import { useEffect, useRef, useState, useCallback } from "react"

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

export default function CustomChatWidget() {
    const [isOpen, setIsOpen] = useState(false)
    const [sessionId, setSessionId] = useState<string | null>(null)
    const [customerInfo, setCustomerInfo] = useState<{ email: string | null; name: string | null }>({
        email: null,
        name: null,
    })
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [inputText, setInputText] = useState("")
    const [sending, setSending] = useState(false)
    const [unreadCount, setUnreadCount] = useState(0)

    const chatEndRef = useRef<HTMLDivElement>(null)
    const lastCountRef = useRef(0)

    // ── Init session ─────────────────────────────────────────────────────────────
    useEffect(() => {
        const initSession = async () => {
            try {
                const fp = await getFingerprint()
                const cust = await retrieveCustomer().catch(() => null)
                const sId = cust?.id || fp
                setSessionId(sId)

                if (cust) {
                    setCustomerInfo({
                        email: cust.email || null,
                        name: `${cust.first_name || ""} ${cust.last_name || ""}`.trim() || null,
                    })
                }
            } catch (err) {
                console.error("Failed to initialize chat session:", err)
            }
        }
        initSession()
    }, [])

    // ── Fetch Messages ───────────────────────────────────────────────────────────
    const fetchMessages = useCallback(async (silent = false) => {
        if (!sessionId) return
        try {
            const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
            const res = await fetch(`${backendUrl}/store/chat/messages?session_id=${sessionId}`, {
                headers: {
                    "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "",
                },
            })
            if (res.ok) {
                const data = await res.json()
                const list: ChatMessage[] = data.messages || []
                setMessages(list)

                // Manage unread badge count
                if (!isOpen) {
                    const newUnread = list.filter(m => m.sender === "admin" && !m.is_read).length
                    setUnreadCount(newUnread)
                } else {
                    setUnreadCount(0)
                }
            }
        } catch (err) {
            console.error("Error fetching chat messages:", err)
        }
    }, [sessionId, isOpen])

    // Initial fetch when sessionId is ready
    useEffect(() => {
        if (sessionId) {
            fetchMessages()
        }
    }, [sessionId, fetchMessages])

    // Polling effect: Poll every 3 seconds
    useEffect(() => {
        if (!sessionId) return
        const interval = setInterval(() => {
            fetchMessages(true)
        }, 3000)
        return () => clearInterval(interval)
    }, [sessionId, fetchMessages])

    // Auto scroll chat to bottom when list changes or opens
    useEffect(() => {
        if (isOpen) {
            chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
            setUnreadCount(0)
        }
    }, [messages, isOpen])

    // Listen for custom trigger (from bulk order client button)
    useEffect(() => {
        const handleOpenChat = () => {
            setIsOpen(true)
        }
        window.addEventListener("open-custom-chat", handleOpenChat)
        return () => window.removeEventListener("open-custom-chat", handleOpenChat)
    }, [])

    // ── Send Message ─────────────────────────────────────────────────────────────
    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!inputText.trim() || !sessionId || sending) return

        const textToSend = inputText.trim()
        setInputText("")
        setSending(true)

        // Optimistically add message to list
        const tempId = Math.random().toString()
        const optMessage: ChatMessage = {
            id: tempId,
            session_id: sessionId,
            sender: "customer",
            content: textToSend,
            customer_name: customerInfo.name,
            customer_email: customerInfo.email,
            is_read: false,
            created_at: new Date().toISOString(),
        }
        setMessages(prev => [...prev, optMessage])

        try {
            const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
            const res = await fetch(`${backendUrl}/store/chat/messages`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "",
                },
                body: JSON.stringify({
                    session_id: sessionId,
                    content: textToSend,
                    customer_name: customerInfo.name,
                    customer_email: customerInfo.email,
                }),
            })
            if (res.ok) {
                // Fetch actual message to sync properly
                await fetchMessages(true)
            } else {
                console.error("Failed to persist message on server")
            }
        } catch (err) {
            console.error("Error sending message:", err)
        } finally {
            setSending(false)
        }
    }

    if (!sessionId) return null

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-inter">
            {/* Chat Box window */}
            {isOpen && (
                <div className="w-[340px] sm:w-[380px] h-[480px] bg-white border border-slate-200 rounded-2xl shadow-2xl flex flex-col overflow-hidden mb-4 transition-all duration-300">
                    {/* Header */}
                    <div className="bg-[#56aebf] p-4 text-white flex items-center justify-between shadow-md">
                        <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
                            <div>
                                <h3 className="font-semibold text-sm">ZAHAN Support</h3>
                                <p className="text-[10px] text-white/80">Typically replies instantly</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-white hover:text-white/80 transition-colors p-1"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Messages Body */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
                        {messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center px-4 text-slate-400">
                                <svg className="w-12 h-12 mb-2 text-slate-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21.75l2.755-4.143a1.11 1.11 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                                </svg>
                                <p className="text-sm font-medium text-slate-500">How can we help you?</p>
                                <p className="text-xs text-slate-400 mt-1">Send a message and support team will reply here shortly.</p>
                            </div>
                        ) : (
                            messages.map((msg) => {
                                const isMe = msg.sender === "customer"
                                return (
                                    <div
                                        key={msg.id}
                                        className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                                    >
                                        <div
                                            className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm leading-relaxed shadow-sm ${
                                                isMe
                                                    ? "bg-[#56aebf] text-white rounded-tr-none"
                                                    : "bg-white text-slate-800 border border-slate-200 rounded-tl-none"
                                            }`}
                                        >
                                            <p className="whitespace-pre-wrap">{msg.content}</p>
                                        </div>
                                        <span className="text-[9px] text-slate-400 font-mono mt-1 px-1">
                                            {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                        </span>
                                    </div>
                                )
                            })
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Footer Form */}
                    <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-100 flex gap-2">
                        <input
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder="Type a message..."
                            className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#56aebf]"
                            disabled={sending}
                        />
                        <button
                            type="submit"
                            disabled={!inputText.trim() || sending}
                            className="bg-[#56aebf] hover:bg-[#458f9e] text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 disabled:hover:bg-[#56aebf]"
                        >
                            Send
                        </button>
                    </form>
                </div>
            )}

            {/* Bubble Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-14 h-14 bg-[#56aebf] text-white rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:scale-105 active:scale-95 transition-all duration-300 relative group"
                aria-label="Open support chat"
            >
                {isOpen ? (
                    // Close Icon
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                ) : (
                    // Chat Bubble Icon
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21.75l2.755-4.143a1.11 1.11 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                    </svg>
                )}

                {/* Unread Count Badge */}
                {unreadCount > 0 && !isOpen && (
                    <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-white shadow-md animate-bounce">
                        {unreadCount}
                    </span>
                )}
            </button>
        </div>
    )
}
