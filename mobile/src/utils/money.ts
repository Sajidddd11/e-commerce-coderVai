/**
 * Currency formatting — ported from web src/lib/util/money.ts
 * Medusa v2 returns amounts in major units (already decimal), so we just format.
 */

type ConvertToLocaleParams = {
  amount: number
  currency_code: string
  minimumFractionDigits?: number
  maximumFractionDigits?: number
  locale?: string
}

export const convertToLocale = ({
  amount,
  currency_code,
  minimumFractionDigits,
  maximumFractionDigits,
  locale = "en-US",
}: ConvertToLocaleParams) => {
  if (!currency_code) return `${amount}`

  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency_code,
      minimumFractionDigits,
      maximumFractionDigits,
    }).format(amount)
  } catch {
    // Fallback if the runtime lacks full Intl currency data
    return `${currency_code.toUpperCase()} ${amount.toFixed(2)}`
  }
}
