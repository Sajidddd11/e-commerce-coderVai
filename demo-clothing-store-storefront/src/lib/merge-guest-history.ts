/**
 * mergeGuestHistory — calls POST /store/recommendations/merge
 * to link all guest browsing events to the authenticated customer.
 *
 * Call this immediately after a successful login or signup.
 * Fire-and-forget — never throws, never blocks the UI.
 */

import { getFingerprint, getSessionId } from "@lib/fingerprint"

const BACKEND_URL =
    process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ||
    process.env.MEDUSA_BACKEND_URL ||
    "http://localhost:9000"

export async function mergeGuestHistory(customerId: string): Promise<void> {
    try {
        const [fingerprint_id, session_id] = await Promise.all([
            getFingerprint(),
            Promise.resolve(getSessionId()),
        ])

        const headers: Record<string, string> = {
            "Content-Type": "application/json",
        }
        if (process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY) {
            headers["x-publishable-api-key"] =
                process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
        }

        fetch(`${BACKEND_URL}/store/recommendations/merge`, {
            method: "POST",
            headers,
            body: JSON.stringify({
                customer_id:    customerId,
                session_id,
                fingerprint_id,
            }),
        }).catch(() => {
            // Silently ignore — merge is non-critical
        })
    } catch {
        // Silently ignore
    }
}
