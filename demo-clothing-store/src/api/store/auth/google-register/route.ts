import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import jwt from "jsonwebtoken"

interface RegisterInput {
    authIdentityId: string
    email: string
    first_name: string
    last_name: string
    phone: string
}

export const POST = async (
    req: MedusaRequest,
    res: MedusaResponse
) => {
    try {
        const { authIdentityId, email, first_name, last_name, phone } = req.body as RegisterInput
        const config = req.scope.resolve("configModule")

        if (!authIdentityId || !email || !first_name || !phone) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields: authIdentityId, email, first_name, and phone are mandatory.",
            })
        }

        const customerModuleService = req.scope.resolve(Modules.CUSTOMER)
        const authModuleService = req.scope.resolve(Modules.AUTH)

        // 1. Check if the customer already exists
        const [existingCustomer] = await customerModuleService.listCustomers(
            { email },
            { select: ["id"] }
        )

        let customerId = existingCustomer?.id

        if (existingCustomer) {
            console.log(`[GOOGLE-REGISTER] Updating existing customer ${customerId} (${email}) profile details`)
            await customerModuleService.updateCustomers(customerId, {
                first_name,
                last_name: last_name || "",
                phone,
                has_account: true,
            } as any)
        } else {
            console.log(`[GOOGLE-REGISTER] Creating new customer record for email ${email}`)
            const newCustomer = await customerModuleService.createCustomers({
                email,
                first_name,
                last_name: last_name || "",
                phone,
                has_account: true,
            } as any)
            customerId = Array.isArray(newCustomer) ? newCustomer[0].id : (newCustomer as any).id
        }

        // 2. Link the AuthIdentity to the Customer record
        const authIdentityObj = await authModuleService.retrieveAuthIdentity(authIdentityId)
        const appMetadata = authIdentityObj.app_metadata || {}
        appMetadata["customer_id"] = customerId

        await authModuleService.updateAuthIdentities({
            id: authIdentityId,
            app_metadata: appMetadata,
        })

        // 3. Retrieve refreshed AuthIdentity to make sure Google provider metadata is loaded
        const authIdentity = await authModuleService.retrieveAuthIdentity(authIdentityId, {
            relations: ["provider_identities"]
        })

        const providerIdentity = authIdentity.provider_identities?.filter(
            (identity: any) => identity.provider === "google"
        )[0]

        // 4. Generate login JWT token containing the actor_id (customer_id)
        const { http } = config.projectConfig
        const expiresIn = http.jwtExpiresIn || "1d"
        const jwtSecret = http.jwtSecret

        const token = jwt.sign(
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

        console.log(`[GOOGLE-REGISTER] Successfully registered and linked customer ${customerId} (${email})`)

        return res.status(200).json({
            success: true,
            token,
        })
    } catch (error: any) {
        console.error("[GOOGLE-REGISTER] Registration failed:", error)
        return res.status(500).json({
            success: false,
            message: error.message || "An unexpected error occurred during Google registration.",
        })
    }
}
