"use client"

import { useEffect, useState } from "react"
import CustomChatWidget from "../custom-chat-widget"

export default function LiveChatLoader() {
    const [enabled, setEnabled] = useState(false)

    useEffect(() => {
        const checkSettings = async () => {
            try {
                const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
                const res = await fetch(`${backendUrl}/store/bulk-products/settings`, {
                    headers: {
                        "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "",
                    },
                })
                if (res.ok) {
                    const data = await res.json()
                    if (data.settings?.livechat_enabled) {
                        setEnabled(true)
                    }
                }
            } catch (err) {
                console.error("Error loading chat settings:", err)
            }
        }
        checkSettings()
    }, [])

    if (!enabled) return null

    return <CustomChatWidget />
}
