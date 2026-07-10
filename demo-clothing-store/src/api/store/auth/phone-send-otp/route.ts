import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { getBulkSmsClient } from "../../../../lib/sms/bulk-sms-bd"
import { upstashRedis } from "../../../../lib/redis/upstash"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const { phone } = req.body as { phone: string }

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required",
      })
    }

    // Normalize phone number (strip spaces, dashes, etc.)
    let normalizedPhone = phone.replace(/[\s\-\(\)]/g, "")
    // Ensure format is either 11 digits (e.g. 01XXXXXXXXX) or 13 digits (8801XXXXXXXXX)
    if (normalizedPhone.startsWith("+")) {
      normalizedPhone = normalizedPhone.substring(1)
    }

    if (!/^(88)?01[3-9]\d{8}$/.test(normalizedPhone)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Bangladeshi mobile number format.",
      })
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()

    // Store in Redis cache (5 minutes expiration)
    await upstashRedis.set(`phone_otp:${normalizedPhone}`, otp, 300)

    // Send SMS via sms.net.bd client
    const smsClient = getBulkSmsClient()
    const storeName = process.env.SMSNETBD_BRAND_NAME || "Zahan"
    const message = `Your ${storeName} verification code is ${otp}. Valid for 5 minutes.`

    console.log(`[PHONE-SEND-OTP] Generated OTP ${otp} for ${normalizedPhone}`)
    
    const smsResult = await smsClient.send({
      numbers: normalizedPhone,
      message,
    })

    if (!smsResult.success) {
      console.error("[PHONE-SEND-OTP] SMS sending failed:", smsResult.description)
      return res.status(500).json({
        success: false,
        message: "Failed to send SMS code. Please try again later.",
      })
    }

    return res.status(200).json({
      success: true,
      message: "Verification code sent successfully.",
    })
  } catch (error: any) {
    console.error("[PHONE-SEND-OTP] Error generating and sending OTP:", error)
    return res.status(500).json({
      success: false,
      message: "An error occurred while generating verification code.",
      error: error.message,
    })
  }
}
