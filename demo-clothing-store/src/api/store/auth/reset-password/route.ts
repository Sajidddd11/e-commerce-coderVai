import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { getOTPManager } from "../../../../lib/otp/otp-manager"
import * as crypto from "crypto"
import { promisify } from "util"

const scrypt = promisify(crypto.scrypt)

/**
 * Hash password using scrypt (same as Medusa's emailpass provider)
 */
async function hashPassword(password: string): Promise<string> {
    const salt = crypto.randomBytes(16).toString("hex")
    const derivedKey = (await scrypt(password, salt, 64)) as Buffer
    return `${salt}:${derivedKey.toString("hex")}`
}

/**
 * POST /store/auth/reset-password
 * Reset password using verified reset token
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
    try {
        const { resetToken, newPassword } = req.body as {
            resetToken: string
            newPassword: string
        }

        // Validate inputs
        if (!resetToken?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Reset token is required",
            })
        }

        if (!newPassword?.trim()) {
            return res.status(400).json({
                success: false,
                message: "New password is required",
            })
        }

        // Validate password strength (minimum 8 characters)
        if (newPassword.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters long",
            })
        }

        // Validate reset token and get phone number
        const otpManager = getOTPManager()
        const phone = await otpManager.validateResetToken(resetToken)

        if (!phone) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired reset token",
            })
        }

        // Get customer by phone number
        const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

        const { data: customers } = await query.graph({
            entity: "customer",
            fields: ["id", "email", "phone"],
            filters: {
                phone,
            },
        })

        if (!customers || customers.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Customer not found",
            })
        }

        const customer = customers[0]

        if (!customer.email) {
            return res.status(400).json({
                success: false,
                message: "Customer email not found",
            })
        }

        // Update password in database
        try {
            // Hash the new password
            const hashedPassword = await hashPassword(newPassword)

            // Get auth module
            const authModule = req.scope.resolve("auth")

            // Get all provider identities for this email
            const providerIdentities = await authModule.listProviderIdentities({
                provider: "emailpass",
                entity_id: customer.email,
            })

            if (!providerIdentities || providerIdentities.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Email/password authentication not found for this account",
                })
            }

            const providerIdentity = providerIdentities[0]

            // Update the password hash
            await authModule.updateProviderIdentities([{
                id: providerIdentity.id,
                provider_metadata: {
                    password_hash: hashedPassword,
                },
            }])

            return res.status(200).json({
                success: true,
                message: "Password reset successfully. You can now log in with your new password.",
            })
        } catch (authError: any) {
            console.error("Error updating password:", authError)

            return res.status(500).json({
                success: false,
                message: "Failed to update password. Please contact support.",
                error: authError.message,
            })
        }
    } catch (error: any) {
        console.error("Error in reset-password:", error)
        return res.status(500).json({
            success: false,
            message: "An error occurred while resetting password",
            error: error.message,
        })
    }
}
