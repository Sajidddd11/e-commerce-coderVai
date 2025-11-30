import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { getOTPManager } from "../../../../lib/otp/otp-manager"

/**
 * POST /store/auth/verify-otp
 * Verify OTP code and issue reset token
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
    try {
        const { phone, otp } = req.body as { phone: string; otp: string }

        // Validate inputs
        if (!phone?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Phone number is required",
            })
        }

        if (!otp?.trim()) {
            return res.status(400).json({
                success: false,
                message: "OTP code is required",
            })
        }

        // Normalize phone number
        const normalizedPhone = phone.replace(/[\s-]/g, "")

        console.log("[VERIFY-OTP] Received phone:", phone)
        console.log("[VERIFY-OTP] Normalized phone:", normalizedPhone)
        console.log("[VERIFY-OTP] Received OTP:", otp.trim())

        // Verify OTP
        const otpManager = getOTPManager()
        const isValid = await otpManager.verifyOTP(normalizedPhone, otp.trim())

        console.log("[VERIFY-OTP] Verification result:", isValid)

        if (!isValid) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired OTP code",
            })
        }

        // Generate reset token (valid for 15 minutes)
        const resetToken = await otpManager.createResetToken(normalizedPhone)

        return res.status(200).json({
            success: true,
            message: "OTP verified successfully",
            resetToken,
        })
    } catch (error: any) {
        console.error("Error in verify-otp:", error)
        return res.status(500).json({
            success: false,
            message: "An error occurred while verifying OTP",
            error: error.message,
        })
    }
}
