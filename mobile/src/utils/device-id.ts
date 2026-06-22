/**
 * Device identity utilities for the mobile app.
 *
 * On mobile we don't need browser fingerprinting tricks —
 * React Native gives us stable device-level IDs natively.
 *
 * Requires:
 *   yarn add react-native-device-info
 *   yarn add @react-native-async-storage/async-storage  (likely already installed)
 */

import AsyncStorage from "@react-native-async-storage/async-storage"

const SESSION_KEY = "rec_session_id"
const FINGERPRINT_KEY = "rec_fingerprint_id"

/**
 * Returns a stable device fingerprint ID.
 * Since react-native-device-info requires a custom dev client,
 * we use a persistent randomly generated ID stored in AsyncStorage.
 */
export async function getDeviceFingerprint(): Promise<string> {
    try {
        let id = await AsyncStorage.getItem(FINGERPRINT_KEY)
        if (!id) {
            const rand = Math.random().toString(36).slice(2, 12)
            id = `mob_fp_${Date.now()}_${rand}`
            await AsyncStorage.setItem(FINGERPRINT_KEY, id)
        }
        return id
    } catch {
        return `mobile_fallback_${Date.now()}`
    }
}

/**
 * Returns a persistent anonymous session ID stored in AsyncStorage.
 * Created once, lives until the app is uninstalled.
 */
export async function getSessionId(): Promise<string> {
    try {
        let id = await AsyncStorage.getItem(SESSION_KEY)
        if (!id) {
            const ts   = Date.now().toString(36)
            const rand = Math.random().toString(36).slice(2, 10)
            id = `mob_${ts}_${rand}`
            await AsyncStorage.setItem(SESSION_KEY, id)
        }
        return id
    } catch {
        return `mob_temp_${Date.now()}`
    }
}

/**
 * Returns both fingerprint and session IDs in one call.
 * Use this before making any tracking or recommendation request.
 */
export async function getIdentity(): Promise<{
    fingerprint_id: string
    session_id:     string
}> {
    const [fingerprint_id, session_id] = await Promise.all([
        getDeviceFingerprint(),
        getSessionId(),
    ])
    return { fingerprint_id, session_id }
}
