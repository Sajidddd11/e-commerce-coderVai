/**
 * Browser fingerprinting utility using FingerprintJS (free, open source).
 *
 * Collects: Canvas hash, WebGL renderer, audio context fingerprint,
 * installed fonts, screen/timezone/language combo, browser plugin list.
 * Accuracy: ~90–95% across Chrome profiles on the same device.
 *
 * Install: npm install @fingerprintjs/fingerprintjs
 *          (or yarn add @fingerprintjs/fingerprintjs)
 *
 * Legal note: Legal in Bangladesh. Does not require user consent there.
 * If you expand to EU markets, add consent gate per GDPR Article 6.
 */

import { v4 as uuidv4 } from "uuid"

const SESSION_KEY     = "rec_session_id"
const FINGERPRINT_KEY = "rec_fingerprint_id"

let cachedFingerprintId: string | null = null
let fpLibLoaded = false

/**
 * Returns a stable browser fingerprint ID.
 * On first call: loads FingerprintJS, computes the fingerprint, caches in memory + localStorage.
 * On subsequent calls: returns cached value instantly.
 */
export async function getFingerprint(): Promise<string> {
    // Return cached in-memory value (fastest path)
    if (cachedFingerprintId) return cachedFingerprintId

    // Return cached localStorage value (avoids re-computing on page refresh)
    if (typeof window !== "undefined") {
        const stored = localStorage.getItem(FINGERPRINT_KEY)
        if (stored) {
            cachedFingerprintId = stored
            return stored
        }
    }

    try {
        // Dynamically import to avoid SSR issues (Next.js)
        const FingerprintJS = await import("@fingerprintjs/fingerprintjs")
        const fp = await FingerprintJS.load()
        const result = await fp.get()
        cachedFingerprintId = result.visitorId

        if (typeof window !== "undefined") {
            localStorage.setItem(FINGERPRINT_KEY, cachedFingerprintId)
            document.cookie = `${FINGERPRINT_KEY}=${cachedFingerprintId}; path=/; max-age=31536000`
        }

        return cachedFingerprintId
    } catch (err) {
        // If FingerprintJS fails (adblock, etc.), fall back to a random ID
        // that persists in localStorage — still better than nothing
        console.warn("[Fingerprint] FingerprintJS failed, using random fallback:", err)
        const fallback = `fb_${uuidv4().replace(/-/g, "").slice(0, 16)}`
        cachedFingerprintId = fallback
        if (typeof window !== "undefined") {
            localStorage.setItem(FINGERPRINT_KEY, fallback)
            document.cookie = `${FINGERPRINT_KEY}=${fallback}; path=/; max-age=31536000`
        }
        return fallback
    }
}

/**
 * Returns a persistent anonymous session ID.
 * Created once per browser, survives page refreshes and tab closes.
 * Used as the anonymous userId for both our DB and Recombee.
 */
export function getSessionId(): string {
    if (typeof window === "undefined") return "ssr"

    let id = localStorage.getItem(SESSION_KEY)
    if (!id) {
        id = `sess_${uuidv4().replace(/-/g, "").slice(0, 20)}`
        localStorage.setItem(SESSION_KEY, id)
    }
    
    // Sync to cookie for server-side cart metadata
    document.cookie = `${SESSION_KEY}=${id}; path=/; max-age=31536000`
    
    return id
}
