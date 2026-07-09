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

function MessageContent({ content }: { content: any }) {
    try {
        const rawContent = typeof content === "string" ? content : JSON.stringify(content)
        const trimmed = rawContent.trim()
        if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
            const data = typeof content === "object" ? content : JSON.parse(trimmed)
            if (data && data.type === "product_inquiry") {
                const { productId, handle, title, thumbnail, message } = data
                
                let countryCode = "bd"
                if (typeof window !== "undefined") {
                    const parts = window.location.pathname.split("/")
                    if (parts[1] && parts[1].length === 2) {
                        countryCode = parts[1]
                    }
                }
                const productUrl = `/${countryCode}/products/${handle}`

                return (
                    <div className="flex flex-col gap-2">
                        {message && <p className="whitespace-pre-wrap break-words">{message}</p>}
                        
                        {/* Embedded Mini Product Card with Thumbnail */}
                        <div className="bg-white border border-slate-200 rounded-xl p-2.5 flex flex-col gap-2 shadow-sm text-slate-800 mt-1 max-w-[280px] w-full select-none">
                            <div className="flex items-center gap-2.5">
                                {thumbnail ? (
                                    <img 
                                        src={thumbnail} 
                                        alt={title} 
                                        className="w-12 h-12 rounded-lg object-cover bg-slate-100 shrink-0 border border-slate-100" 
                                    />
                                ) : (
                                    <div className="w-12 h-12 rounded-lg bg-[#56aebf]/10 text-[#56aebf] flex items-center justify-center shrink-0">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                                        </svg>
                                    </div>
                                )}
                                <div className="flex-1 min-w-0 text-left">
                                    <h4 className="font-semibold text-xs text-slate-900 truncate leading-snug">{title}</h4>
                                    <p className="text-[10px] text-slate-400 truncate">Bulk Order Inquiry</p>
                                </div>
                            </div>
                            
                            <a
                                href={productUrl}
                                className="flex items-center justify-center gap-1 w-full py-1.5 px-3 bg-[#56aebf] hover:bg-[#458f9e] text-white font-semibold text-[10px] rounded-lg transition-colors text-center"
                            >
                                <span>View Product</span>
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
                {textBeforeLink && <p className="whitespace-pre-wrap break-words">{textBeforeLink}</p>}
                
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex flex-col gap-2 shadow-sm text-slate-800 mt-1 max-w-[280px] w-full select-none">
                    <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-lg bg-[#56aebf]/10 text-[#56aebf] flex items-center justify-center shrink-0">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                            </svg>
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                            <h4 className="font-semibold text-xs text-slate-900 truncate leading-snug">{productName}</h4>
                            <p className="text-[10px] text-slate-400 truncate">Bulk Inquiry Item</p>
                        </div>
                    </div>
                    <a
                        href={productUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-1 w-full py-1.5 px-3 bg-[#56aebf] hover:bg-[#458f9e] text-white font-semibold text-[10px] rounded-lg transition-colors text-center"
                    >
                        <span>View Product</span>
                        <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                        </svg>
                    </a>
                </div>
            </div>
        )
    }

    return <p className="whitespace-pre-wrap break-words">{rawContent}</p>
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

    // Guest lead capture states
    const [guestName, setGuestName] = useState("")
    const [guestPhone, setGuestPhone] = useState("")
    const [hasSubmittedDetails, setHasSubmittedDetails] = useState(false)

    const chatEndRef = useRef<HTMLDivElement>(null)
    const [pendingInquiry, setPendingInquiry] = useState<string | null>(null)

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
                    setHasSubmittedDetails(true)
                } else {
                    // Check if guest details exist in localStorage
                    const savedName = localStorage.getItem("chat_guest_name")
                    const savedPhone = localStorage.getItem("chat_guest_phone")
                    if (savedName && savedPhone) {
                        setCustomerInfo({
                            email: savedPhone, // Use phone as email identifier for guest sessions
                            name: savedName,
                        })
                        setHasSubmittedDetails(true)
                    }
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
        if (isOpen && hasSubmittedDetails) {
            chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
            setUnreadCount(0)
        }
    }, [messages, isOpen, hasSubmittedDetails])

    // Listen for custom trigger (from bulk order client button)
    useEffect(() => {
        const handleOpenChat = (e: Event) => {
            setIsOpen(true)
            const customEvent = e as CustomEvent
            if (customEvent.detail && customEvent.detail.prefill) {
                const dataStr = customEvent.detail.prefill
                if (hasSubmittedDetails) {
                    sendPrefilledMessage(dataStr)
                } else {
                    setPendingInquiry(dataStr)
                }
            }
        }
        window.addEventListener("open-custom-chat", handleOpenChat)
        return () => window.removeEventListener("open-custom-chat", handleOpenChat)
    }, [hasSubmittedDetails, sessionId, customerInfo])

    const sendPrefilledMessage = async (contentStr: string, freshName?: string, freshEmail?: string) => {
        if (!sessionId) return
        setSending(true)

        const name = freshName || customerInfo.name
        const email = freshEmail || customerInfo.email

        const tempId = Math.random().toString()
        const optMessage: ChatMessage = {
            id: tempId,
            session_id: sessionId,
            sender: "customer",
            content: contentStr,
            customer_name: name,
            customer_email: email,
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
                    content: contentStr,
                    customer_name: name,
                    customer_email: email,
                }),
            })
            if (res.ok) {
                await fetchMessages(true)
            } else {
                console.error("Failed to persist message on server")
            }
        } catch (err) {
            console.error("Error sending prefilled message:", err)
        } finally {
            setSending(false)
        }
    }

    // ── Guest Form Submit ────────────────────────────────────────────────────────
    const handleGuestFormSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!guestName.trim() || !guestPhone.trim()) return

        const name = guestName.trim()
        const phone = guestPhone.trim()

        localStorage.setItem("chat_guest_name", name)
        localStorage.setItem("chat_guest_phone", phone)

        setCustomerInfo({
            email: phone,
            name: name,
        })
        setHasSubmittedDetails(true)

        if (pendingInquiry) {
            sendPrefilledMessage(pendingInquiry, name, phone)
            setPendingInquiry(null)
        }
    }

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
        <div className="font-inter">
            {/* Chat Box window */}
            {isOpen && (
                <div className="fixed bottom-[84px] right-4 left-4 sm:left-auto sm:right-20 md:right-24 sm:w-[360px] h-[480px] max-h-[calc(100vh-120px)] bg-white border border-slate-200 rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50 transition-all duration-300">
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

                    {/* Messages Body / Lead Info Form */}
                    {!hasSubmittedDetails ? (
                        <div className="flex-1 flex flex-col justify-center p-5 bg-slate-50 text-slate-800 overflow-y-auto">
                            <div className="text-center mb-5">
                                <div className="w-12 h-12 rounded-full bg-[#56aebf]/10 text-[#56aebf] flex items-center justify-center mx-auto mb-3">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                                    </svg>
                                </div>
                                <h4 className="font-bold text-sm text-slate-800">Welcome to Live Support</h4>
                                <p className="text-[11px] text-slate-500 mt-1 max-w-[220px] mx-auto">Please introduce yourself to start a live support chat.</p>
                            </div>
                            <form onSubmit={handleGuestFormSubmit} className="space-y-3.5">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Your Name</label>
                                    <input
                                        type="text"
                                        value={guestName}
                                        onChange={(e) => setGuestName(e.target.value)}
                                        placeholder="e.g. John Doe"
                                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#56aebf] bg-white text-slate-800"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Phone Number</label>
                                    <input
                                        type="tel"
                                        value={guestPhone}
                                        onChange={(e) => setGuestPhone(e.target.value)}
                                        placeholder="e.g. +88017xxxxxxxx"
                                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#56aebf] bg-white text-slate-800"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full bg-[#56aebf] hover:bg-[#458f9e] text-white py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors mt-2"
                                >
                                    Start Chat
                                </button>
                            </form>
                        </div>
                    ) : (
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
                                                className={`max-w-[80%] sm:max-w-[75%] rounded-2xl px-4 py-2 text-sm leading-relaxed shadow-sm ${
                                                    isMe
                                                        ? "bg-[#56aebf] text-white rounded-tr-none"
                                                        : "bg-white text-slate-800 border border-slate-200 rounded-tl-none"
                                                }`}
                                            >
                                                <MessageContent content={msg.content} />
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
                    )}

                    {/* Footer Form - only shown after guest details submitted */}
                    {hasSubmittedDetails && (
                        <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-100 flex gap-2">
                            <input
                                type="text"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                placeholder="Type a message..."
                                className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#56aebf] bg-white text-slate-800"
                                disabled={sending}
                            />
                            <button
                                type="submit"
                                disabled={!inputText.trim() || sending}
                                className="bg-[#56aebf] hover:bg-[#458f9e] text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
                            >
                                Send
                            </button>
                        </form>
                    )}
                </div>
            )}

            {/* Bubble Button */}
            <div className="fixed bottom-4 right-20 md:bottom-6 md:right-24 z-50 flex items-center justify-center">
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
        </div>
    )
}
