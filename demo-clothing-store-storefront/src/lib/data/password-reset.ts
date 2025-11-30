"use server"

const BACKEND_URL = process.env.MEDUSA_BACKEND_URL || process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""

/**
 * Request password reset via SMS OTP
 */
export async function requestPasswordReset(email: string): Promise<{ error: string | null; phone?: string }> {
    try {
        const response = await fetch(`${BACKEND_URL}/store/auth/request-password-reset`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-publishable-api-key": PUBLISHABLE_KEY,
            },
            body: JSON.stringify({ email }),
        })

        const data = await response.json()

        if (!response.ok || !data.success) {
            return { error: data.message || "Failed to send OTP. Please try again.", phone: undefined }
        }

        // Success - return phone number from backend
        return { error: null, phone: data.phone }
    } catch (error: any) {
        console.error("Error requesting password reset:", error)
        return { error: "Network error. Please check your connection and try again.", phone: undefined }
    }
}

/**
 * Verify OTP code
 */
export async function verifyOTP(
    phone: string,
    otp: string
): Promise<{ error?: string; resetToken?: string }> {
    try {
        const response = await fetch(`${BACKEND_URL}/store/auth/verify-otp`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-publishable-api-key": PUBLISHABLE_KEY,
            },
            body: JSON.stringify({ phone, otp }),
        })

        const data = await response.json()

        if (!response.ok || !data.success) {
            return { error: data.message || "Invalid or expired OTP code" }
        }

        return { resetToken: data.resetToken }
    } catch (error: any) {
        console.error("Error verifying OTP:", error)
        return { error: "Network error. Please check your connection and try again." }
    }
}

/**
 * Reset password with verified token
 */
export async function resetPassword(
    resetToken: string,
    newPassword: string
): Promise<string | null> {
    try {
        const response = await fetch(`${BACKEND_URL}/store/auth/reset-password`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-publishable-api-key": PUBLISHABLE_KEY,
            },
            body: JSON.stringify({ resetToken, newPassword }),
        })

        const data = await response.json()

        if (!response.ok || !data.success) {
            return data.message || "Failed to reset password. Please try again."
        }

        return null // Success
    } catch (error: any) {
        console.error("Error resetting password:", error)
        return "Network error. Please check your connection and try again."
    }
}
