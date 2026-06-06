import { MEDUSA_BACKEND, PUBLISHABLE_KEY } from "./sdk"

/**
 * SMS OTP password reset, ported from web src/lib/data/password-reset.ts.
 * Uses raw fetch against custom backend routes (not the Medusa SDK).
 */

function headers() {
  return {
    "Content-Type": "application/json",
    ...(PUBLISHABLE_KEY ? { "x-publishable-api-key": PUBLISHABLE_KEY } : {}),
  }
}

export async function requestPasswordReset(
  email: string
): Promise<{ error: string | null; phone?: string }> {
  try {
    const res = await fetch(
      `${MEDUSA_BACKEND}/store/auth/request-password-reset`,
      { method: "POST", headers: headers(), body: JSON.stringify({ email }) }
    )
    const data = await res.json()
    if (!res.ok || !data?.success) {
      return { error: data?.message ?? "Could not send reset code" }
    }
    return { error: null, phone: data.phone }
  } catch (e: any) {
    return { error: e?.message ?? "Network error" }
  }
}

export async function verifyOTP(
  phone: string,
  otp: string
): Promise<{ error: string | null; resetToken?: string }> {
  try {
    const res = await fetch(`${MEDUSA_BACKEND}/store/auth/verify-otp`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({ phone, otp }),
    })
    const data = await res.json()
    if (!res.ok || !data?.success) {
      return { error: data?.message ?? "Invalid code" }
    }
    return { error: null, resetToken: data.resetToken }
  } catch (e: any) {
    return { error: e?.message ?? "Network error" }
  }
}

export async function resetPassword(
  resetToken: string,
  newPassword: string
): Promise<string | null> {
  try {
    const res = await fetch(`${MEDUSA_BACKEND}/store/auth/reset-password`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({ resetToken, newPassword }),
    })
    const data = await res.json()
    if (!res.ok || !data?.success) {
      return data?.message ?? "Could not reset password"
    }
    return null
  } catch (e: any) {
    return e?.message ?? "Network error"
  }
}
