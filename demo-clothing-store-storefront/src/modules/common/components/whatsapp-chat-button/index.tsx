"use client"

import { WhatsAppIcon } from "@modules/common/icons/social-icons"
import { useEffect, useState } from "react"

export default function WhatsAppChatButton() {
    const [showPulse, setShowPulse] = useState(true)

    useEffect(() => {
        // Stop pulse animation after 10 seconds
        const timer = setTimeout(() => {
            setShowPulse(false)
        }, 10000)

        return () => clearTimeout(timer)
    }, [])

    return (
        <a
            href="https://wa.me/8809677610610?text=Hello%2C%20I%20need%20support"
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 bg-green-500 hover:bg-green-600 text-white p-3 md:p-4 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_6px_30px_rgba(34,197,94,0.4)] transition-all duration-300 hover:scale-110 group"
            aria-label="Chat on WhatsApp"
        >
            <WhatsAppIcon size={20} className="md:w-7 md:h-7" />

            {/* Tooltip */}
            <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                Chat with us on WhatsApp
            </span>

            {/* Pulse animation - only shows for first 10 seconds */}
            {showPulse && (
                <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75"></span>
            )}
        </a>
    )
}
