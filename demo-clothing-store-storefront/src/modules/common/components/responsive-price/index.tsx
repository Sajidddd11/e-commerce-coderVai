import { parseCurrencyPrice } from "@lib/util/parse-currency-price"

interface ResponsivePriceProps {
  formattedPrice: string
  baseClassName?: string
  priceClassName?: string
  currencyClassName?: string
  showCurrency?: boolean
}

/**
 * Responsive price component that renders currency at 2 font sizes smaller on mobile
 * On desktop, both currency and price are the same size
 *
 * Usage:
 * <ResponsivePrice formattedPrice="BDT 300" baseClassName="text-lg small:text-xl" />
 *
 * Mobile: BDT (text-xs) 300 (text-lg)
 * Small breakpoint: BDT (text-sm) 300 (text-xl)
 *
 * Note: baseClassName should be a complete Tailwind class string with breakpoints
 */
export default function ResponsivePrice({
  formattedPrice,
  baseClassName = "text-lg small:text-xl",
  priceClassName = "",
  currencyClassName = "",
  showCurrency = true,
}: ResponsivePriceProps) {
  const parsed = parseCurrencyPrice(formattedPrice)

  if (!parsed) {
    return <span className={baseClassName}>{formattedPrice}</span>
  }

  const { currency, amount } = parsed

  // If no currency or shouldn't show, just display amount
  if (!showCurrency || !currency) {
    return <span className={baseClassName}>{amount}</span>
  }

  // Mobile currency: 2 sizes smaller than base (text-xs for text-lg base)
  // Small breakpoint currency: text-sm (2 sizes smaller than text-xl)
  // This pattern works for text-lg/text-xl base sizes
  const currencySize = "text-xs small:text-sm"

  return (
    <span className="inline-flex items-baseline gap-1">
      <span className="font-bold text-sm xsmall:text-xl text-red-600">
        {currency}
      </span>
      <span className="font-bold text-xl text-red-600">{amount}</span>
    </span>
  )
}
