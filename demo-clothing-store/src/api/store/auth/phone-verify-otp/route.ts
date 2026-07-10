import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import { upstashRedis } from "../../../../lib/redis/upstash"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const { phone, otp } = req.body as { phone: string; otp: string }

    if (!phone || !otp) {
      return res.status(400).json({
        success: false,
        message: "Phone number and OTP code are required",
      })
    }

    // Normalize phone number
    let normalizedPhone = phone.replace(/[\s\-\(\)]/g, "")
    if (normalizedPhone.startsWith("+")) {
      normalizedPhone = normalizedPhone.substring(1)
    }

    // Retrieve cached OTP
    const cachedOtp = await upstashRedis.get<string>(`phone_otp:${normalizedPhone}`)

    if (!cachedOtp || cachedOtp !== otp.trim()) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP code.",
      })
    }

    // Query Customer module to see if the phone number already exists
    const customerModuleService = req.scope.resolve(Modules.CUSTOMER)
    
    // We search by phone number (since uniqueness is enforced, we just check if it exists)
    // Note: Look for both standard (01X) and 8801X formats
    const searchPhone = normalizedPhone.startsWith("88") 
      ? [normalizedPhone, normalizedPhone.substring(2)]
      : [normalizedPhone, "88" + normalizedPhone]

    const [existingCustomer] = await customerModuleService.listCustomers(
      { phone: searchPhone },
      { select: ["id", "email"] }
    )

    return res.status(200).json({
      success: true,
      exists: !!existingCustomer,
      email: existingCustomer?.email || null,
      message: "OTP verified successfully.",
    })
  } catch (error: any) {
    console.error("[PHONE-VERIFY-OTP] Error verifying OTP:", error)
    return res.status(500).json({
      success: false,
      message: "An error occurred while verifying the code.",
      error: error.message,
    })
  }
}
