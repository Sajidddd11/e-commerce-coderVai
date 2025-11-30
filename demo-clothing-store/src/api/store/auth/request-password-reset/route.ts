import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { getBulkSmsClient } from "../../../../lib/sms/bulk-sms-bd"
import { getOTPManager } from "../../../../lib/otp/otp-manager"

/**
 * POST /store/auth/request-password-reset
 * Request password reset via SMS OTP - accepts email,sends OTP to registered phone
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
    try {
        const { email } = req.body as { email: string }

        // Validate email
        if (!email?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Email is required",
            })
        }

        // Get customer by email
        const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

        const { data: customers } = await query.graph({
            entity: "customer",
            fields: ["id", "email", "phone", "has_account"],
            filters: {
                email: email.toLowerCase(),
            },
        })

        if (!customers || customers.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No account found with this email address",
            })
        }

        const customer = customers[0]

        // Check if customer has an account
        if (!customer.has_account) {
            return res.status(400).json({
                success: false,
                message: "This email is not registered for login",
            })
        }

        // Check if customer has a phone number
        if (!customer.phone) {
            return res.status(400).json({
                success: false,
                message: "No phone number registered with this account. Please contact support.",
            })
        }

        // Rate limiting check
        const otpManager = getOTPManager()
        const canRequest = await otpManager.canRequestOTP(customer.phone)

        if (!canRequest) {
            return res.status(429).json({
                success: false,
                message: "Too many OTP requests. Please try again in an hour.",
            })
        }

        // Generate OTP
        const otp = await otpManager.createOTP(customer.phone, 5)

        // Send SMS
        const smsClient = getBulkSmsClient()
        const storeName = process.env.BULKSMSBD_BRAND_NAME || "Medusa Store"
        const phoneLastFour = customer.phone.slice(-4)

        const message = `Your ${storeName} password reset OTP: ${otp}\\n\\nValid for 5 minutes. Do not share this code.`

        const smsResult = await smsClient.send({
            numbers: customer.phone,
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
        await otpManager.recordOTPRequest(customer.phone)

        return res.status(200).json({
            success: true,
            message: `OTP sent to your registered phone number ending in ${phoneLastFour}`,
            phone: customer.phone, // Frontend needs this to pass to verify-otp
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
