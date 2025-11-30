import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { getBulkSmsClient } from "../../../../lib/sms/bulk-sms-bd"
import { getOTPManager } from "../../../../lib/otp/otp-manager"

/**
 * POST /store/auth/request-password-reset
 * Request password reset via SMS OTP
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
    try {
        const { phone } = req.body as { phone: string }

        // Validate phone number
        if (!phone?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Phone number is required",
            })
        }

        // Normalize phone number (remove spaces, dashes)
        const normalizedPhone = phone.replace(/[\s-]/g, "")

        // Get query to check if customer exists with this phone
        const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

        const { data: customers } = await query.graph({
            entity: "customer",
            fields: ["id", "email", "phone", "has_account"],
            filters: {
                phone: normalizedPhone,
            },
        })

        if (!customers || customers.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No account found with this phone number",
            })
        }

        const customer = customers[0]

        // Check if customer has an account (password-based login)
        if (!customer.has_account) {
            return res.status(400).json({
                success: false,
                message: "This account does not support password login",
            })
        }

        // Rate limiting check
        const otpManager = getOTPManager()
        const rateLimitCheck = await otpManager.canRequestOTP(normalizedPhone)

        if (!rateLimitCheck.allowed) {
            return res.status(429).json({
                success: false,
                message: `Too many OTP requests. Please try again in ${rateLimitCheck.remainingTime} minutes`,
            })
        }

        // Generate OTP
        const otp = await otpManager.createOTP(normalizedPhone, 5) // 5 minutes expiration

        // Send SMS
        const smsClient = getBulkSmsClient()
        const storeName = process.env.BULKSMSBD_BRAND_NAME || "Medusa Store"

        const message = `Your ${storeName} password reset OTP: ${otp}\n\nValid for 5 minutes. Do not share this code.`

        const smsResult = await smsClient.send({
            numbers: normalizedPhone,
            message,
        })

        if (!smsResult.success) {
            return res.status(500).json({
                success: false,
                message: "Failed to send OTP. Please try again.",
                error: smsResult.description,
            })
        }

        // Record OTP request for rate limiting
        await otpManager.recordOTPRequest(normalizedPhone)

        return res.status(200).json({
            success: true,
            message: "OTP sent to your phone number",
            phone: normalizedPhone,
        })
    } catch (error: any) {
        console.error("Error in request-password-reset:", error)
        return res.status(500).json({
            success: false,
            message: "An error occurred while processing your request",
            error: error.message,
        })
    }
}
