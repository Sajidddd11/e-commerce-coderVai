import { removeCartId } from "@lib/data/cookies"
import { NextRequest, NextResponse } from "next/server"

/**
 * API Route to clear cart cookie
 * Required because cart cookie is httpOnly and cannot be cleared from client-side JavaScript
 */
export async function POST(req: NextRequest) {
    try {
        await removeCartId()

        return NextResponse.json({ success: true }, { status: 200 })
    } catch (error) {
        console.error("[API] Failed to clear cart:", error)
        return NextResponse.json(
            { success: false, error: "Failed to clear cart" },
            { status: 500 }
        )
    }
}
