import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import jwt from "jsonwebtoken"

/**
 * POST /store/auth/google-link
 * Resolves Google OAuth callback token, automatically links to an existing customer record 
 * (if they signed up with email/password previously) or creates a new one.
 * Returns a fully populated JWT login session token with actor_id.
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
    try {
        const { token } = req.body as { token: string }

        if (!token) {
            return res.status(400).json({
                success: false,
                message: "Token is required",
            })
        }

        const config = req.scope.resolve(ContainerRegistrationKeys.CONFIG_MODULE)
        const jwtSecret = config.projectConfig.http.jwtSecret || "supersecret"

        // 1. Verify the initial callback token
        let decoded: any
        try {
            decoded = jwt.verify(token, jwtSecret)
        } catch (err: any) {
            return res.status(401).json({
                success: false,
                message: "Invalid or expired authentication token",
                error: err.message,
            })
        }

        const authIdentityId = decoded.auth_identity_id
        const userMetadata = decoded.user_metadata || {}
        const email = userMetadata.email

        if (!authIdentityId || !email) {
            return res.status(400).json({
                success: false,
                message: "Invalid token payload: missing auth_identity_id or email",
            })
        }

        // 2. Resolve required Medusa modules
        const customerModuleService = req.scope.resolve(Modules.CUSTOMER)
        const authModuleService = req.scope.resolve(Modules.AUTH)

        // 3. Find if a Customer with this email already exists
        const [existingCustomer] = await customerModuleService.listCustomers(
            { email },
            { select: ["id", "email", "first_name", "last_name"] }
        )

        let customerId = existingCustomer?.id

        if (existingCustomer) {
            console.log(`[GOOGLE-LINK] Linking existing customer ${customerId} (${email}) to auth identity ${authIdentityId}`)
        } else {
            console.log(`[GOOGLE-LINK] Customer record not found for email ${email}. Creating a new profile...`)
            
            // Create a new Customer record
            const newCustomer = await customerModuleService.createCustomers({
                email,
                first_name: userMetadata.given_name || userMetadata.name || "Google User",
                last_name: userMetadata.family_name || "",
            })
            
            customerId = newCustomer.id
        }

        // 4. Link by updating the app_metadata json column on the AuthIdentity
        const authIdentityObj = await authModuleService.retrieveAuthIdentity(authIdentityId)
        const appMetadata = authIdentityObj.app_metadata || {}
        appMetadata["customer_id"] = customerId

        await authModuleService.updateAuthIdentities({
            id: authIdentityId,
            app_metadata: appMetadata,
        })

        // Retrieve refreshed AuthIdentity to make sure Google provider metadata is loaded
        const authIdentity = await authModuleService.retrieveAuthIdentity(authIdentityId, {
            relations: ["provider_identities"]
        })

        const providerIdentity = authIdentity.provider_identities?.filter(
            (identity: any) => identity.provider === "google"
        )[0]

        // 5. Generate a new, fully populated login JWT containing the actor_id (customer_id)
        const { http } = config.projectConfig
        const expiresIn = http.jwtExpiresIn || "1d"

        const finalToken = jwt.sign(
            {
                actor_id: customerId,
                actor_type: "customer",
                auth_identity_id: authIdentityId,
                app_metadata: {
                    customer_id: customerId,
                },
                user_metadata: providerIdentity?.user_metadata ?? {},
            },
            jwtSecret,
            {
                expiresIn,
            }
        )

        return res.status(200).json({
            success: true,
            token: finalToken,
        })
    } catch (error: any) {
        console.error("[GOOGLE-LINK] Internal error:", error)
        return res.status(500).json({
            success: false,
            message: "Failed to process Google authentication linking",
            error: error.message,
        })
    }
}
