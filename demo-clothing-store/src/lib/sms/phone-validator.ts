/**
 * Validates and normalizes Bangladeshi phone numbers
 */

export type PhoneValidationResult = {
  isValid: boolean
  normalized?: string
  error?: string
}

/**
 * Validates and normalizes a Bangladeshi phone number
 * Accepts formats:
 * - +8801XXXXXXXXX
 * - 8801XXXXXXXXX
 * - 01XXXXXXXXX
 * - 1XXXXXXXXX
 * 
 * Returns normalized format: 8801XXXXXXXXX
 */
export function validateAndNormalizeBDPhone(phone: string | null | undefined): PhoneValidationResult {
  if (!phone) {
    return {
      isValid: false,
      error: "Phone number is required",
    }
  }

  // Remove spaces, dashes, parentheses, and other common separators
  let cleaned = phone.replace(/[\s\-\(\)\+]/g, "")

  // Remove leading 0 if present (Bangladeshi format: 01XXXXXXXXX)
  if (cleaned.startsWith("0")) {
    cleaned = cleaned.substring(1)
  }

  // Bangladesh mobile patterns
  // Valid operators: 013, 014, 015, 016, 017, 018, 019
  // Pattern matches: 1[3-9]XXXXXXXX or 8801[3-9]XXXXXXXX
  const bdPattern = /^(?:880)?1[3-9]\d{8}$/

  if (!bdPattern.test(cleaned)) {
    return {
      isValid: false,
      error: "Invalid Bangladeshi phone number format. Must be a valid mobile number (013-019)",
    }
  }

  // Normalize to 8801XXXXXXXXX format
  let normalized = cleaned
  if (!normalized.startsWith("880")) {
    normalized = "880" + normalized
  }

  return {
    isValid: true,
    normalized,
  }
}

/**
 * Validates and normalizes multiple phone numbers
 */
export function validateAndNormalizePhones(
  phones: string[] | string
): { valid: string[]; invalid: Array<{ phone: string; error: string }> } {
  const phoneArray = Array.isArray(phones)
    ? phones
    : typeof phones === "string"
      ? phones.split(/[,|\s]+/).filter(Boolean)
      : []

  const valid: string[] = []
  const invalid: Array<{ phone: string; error: string }> = []

  for (const phone of phoneArray) {
    const result = validateAndNormalizeBDPhone(phone)
    if (result.isValid && result.normalized) {
      valid.push(result.normalized)
    } else {
      invalid.push({
        phone: phone.trim(),
        error: result.error || "Invalid phone number",
      })
    }
  }

  return { valid, invalid }
}

/**
 * Masks a phone number for logging (shows last 4 digits only)
 */
export function maskPhoneNumber(phone: string): string {
  if (!phone || phone.length < 4) {
    return "****"
  }
  const lastFour = phone.slice(-4)
  const masked = "*".repeat(Math.max(0, phone.length - 4))
  return masked + lastFour
}

