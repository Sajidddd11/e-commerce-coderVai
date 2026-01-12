/**
 * Parses a formatted price string (e.g., "BDT 300" or "$300") into currency and amount parts
 * Handles various Intl.NumberFormat outputs across different locales
 */
export const parseCurrencyPrice = (
  formattedPrice: string
): { currency: string; amount: string } | null => {
  if (!formattedPrice || typeof formattedPrice !== "string") {
    return null
  }

  // Trim whitespace
  const trimmed = formattedPrice.trim()

  // Pattern 1: Currency code followed by amount (e.g., "BDT 300", "USD 100.50")
  // Matches: 1-3 uppercase letters followed by space and numbers
  const codeMatch = trimmed.match(/^([A-Z]{1,3})\s*(.+)$/)
  if (codeMatch) {
    return {
      currency: codeMatch[1],
      amount: codeMatch[2].trim(),
    }
  }

  // Pattern 2: Currency symbol followed by amount (e.g., "$300", "£100.50")
  // Matches: single special char (symbol) followed by numbers
  const symbolMatch = trimmed.match(/^([^\d\s]+)\s*(.+)$/)
  if (symbolMatch && symbolMatch[2]) {
    return {
      currency: symbolMatch[1].trim(),
      amount: symbolMatch[2].trim(),
    }
  }

  // Pattern 3: Amount followed by currency code (e.g., "300 BDT" in some locales)
  const amountFirstMatch = trimmed.match(/^(.+?)\s+([A-Z]{1,3})$/)
  if (amountFirstMatch) {
    return {
      currency: amountFirstMatch[2],
      amount: amountFirstMatch[1].trim(),
    }
  }

  // Fallback: return the whole string as amount with no currency
  return {
    currency: "",
    amount: trimmed,
  }
}
