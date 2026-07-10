import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import jwt from "jsonwebtoken"
import { upstashRedis } from "../../../../lib/redis/upstash"

interface PhoneRegisterInput {
  phone: string
  otp: string
  first_name: string
  last_name?: string
  password?: string
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const { phone, otp, first_name, last_name, password } = req.body as PhoneRegisterInput
    const config = req.scope.resolve("configModule")

    if (!phone || !otp || !first_name || !password) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: phone, otp, first_name, and password are required.",
      })
    }

    // Normalize phone number
    let normalizedPhone = phone.replace(/[\s\-\(\)]/g, "")
    if (normalizedPhone.startsWith("+")) {
      normalizedPhone = normalizedPhone.substring(1)
    }

    // 1. Verify OTP code
    const cachedOtp = await upstashRedis.get<string>(`phone_otp:${normalizedPhone}`)

    if (!cachedOtp || cachedOtp !== otp.trim()) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification code.",
      })
    }

    const customerModuleService = req.scope.resolve(Modules.CUSTOMER)
    const authModuleService = req.scope.resolve(Modules.AUTH)

    // 2. Enforce mobile number uniqueness
    const searchPhone = normalizedPhone.startsWith("88") 
      ? [normalizedPhone, normalizedPhone.substring(2)]
      : [normalizedPhone, "88" + normalizedPhone]

    const [existingCustomer] = await customerModuleService.listCustomers(
      { phone: searchPhone } as any,
      { select: ["id"] } as any
    )

    if (existingCustomer) {
      return res.status(400).json({
        success: false,
        message: "This mobile number is already registered to another account.",
      })
    }

    // 3. Register AuthIdentity using built-in emailpass provider (passing phone as identifier)
    const authResult = await authModuleService.register("emailpass", {
      body: {
        email: normalizedPhone,
        password: password,
      },
      url: req.url,
      headers: req.headers as any,
      query: req.query as any,
      protocol: req.protocol,
    })

    if (!authResult.success || !authResult.authIdentity) {
      return res.status(400).json({
        success: false,
        message: authResult.error || "Failed to register account credentials.",
      })
    }

    const authIdentityId = authResult.authIdentity.id

    // 4. Create new customer profile (without email)
    const newCustomer = await customerModuleService.createCustomers({
      phone: normalizedPhone,
      first_name,
      last_name: last_name || "",
      email: null,
      has_account: true,
    } as any)

    const customerId = Array.isArray(newCustomer) ? newCustomer[0].id : (newCustomer as any).id

    // 5. Link the AuthIdentity to the Customer
    const appMetadata = authResult.authIdentity.app_metadata || {}
    appMetadata["customer_id"] = customerId

    await authModuleService.updateAuthIdentities({
      id: authIdentityId,
      app_metadata: appMetadata,
    })

    // 6. Delete OTP from cache
    await upstashRedis.del(`phone_otp:${normalizedPhone}`)

    // 7. Generate login JWT session token
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
        user_metadata: {},
      },
      jwtSecret,
      {
        expiresIn,
      }
    )

    console.log(`[PHONE-REGISTER] Successfully created customer account ${customerId} for phone ${normalizedPhone}`)

    return res.status(200).json({
      success: true,
      token,
    })
  } catch (error: any) {
    console.error("[PHONE-REGISTER] Registration flow failed:", error)
    return res.status(500).json({
      success: false,
      message: error.message || "An unexpected error occurred during account registration.",
    })
  }
}
