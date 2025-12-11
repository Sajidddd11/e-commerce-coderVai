"use client"

import { convertToLocale } from "@lib/util/money"
import React, { useMemo } from "react"

type CartTotalsProps = {
  totals: {
    total?: number | null
    subtotal?: number | null
    tax_total?: number | null
    currency_code: string
    item_subtotal?: number | null
    shipping_subtotal?: number | null
    discount_subtotal?: number | null
    shipping_address?: {
      city?: string
      [key: string]: any
    }
  }
  shippingOverride?: number // For instant UI update when selecting shipping
}

const CartTotals: React.FC<CartTotalsProps> = ({ totals, shippingOverride }) => {
  const {
    currency_code,
    total,
    tax_total,
    item_subtotal,
    shipping_subtotal,
    discount_subtotal,
    shipping_address,
  } = totals

  // If shippingOverride is provided, use it instead of server shipping_subtotal
  const displayShipping = shippingOverride !== undefined ? shippingOverride : (shipping_subtotal ?? 0)

  // Recalculate total when using shipping override
  const displayTotal = useMemo(() => {
    if (shippingOverride !== undefined) {
      // Recalculate: subtotal + shipping - discount + tax
      return (item_subtotal ?? 0) + displayShipping - (discount_subtotal ?? 0) + (tax_total ?? 0)
    }
    return total ?? 0
  }, [shippingOverride, item_subtotal, displayShipping, discount_subtotal, tax_total, total])

  // Determine delivery days based on city
  const isDhaka = shipping_address?.city?.toLowerCase().includes('dhaka')
  const deliveryDays = isDhaka ? '2-3' : '5-7'

  return (
    <div>
      <div className="flex flex-col gap-y-2 txt-medium text-ui-fg-subtle ">
        <div className="flex items-center justify-between">
          <span>Subtotal (excl. shipping and taxes)</span>
          <span className=" font-semibold" data-testid="cart-subtotal" data-value={item_subtotal || 0}>
            {convertToLocale({ amount: item_subtotal ?? 0, currency_code })}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span>Shipping</span>
          <span data-testid="cart-shipping" data-value={displayShipping}>
            {convertToLocale({ amount: displayShipping, currency_code })}
          </span>
        </div>
        {!!discount_subtotal && (
          <div className="flex items-center justify-between">
            <span>Discount</span>
            <span
              className=" text-red-500"
              data-testid="cart-discount"
              data-value={discount_subtotal || 0}
            >
              -{" "}
              {convertToLocale({
                amount: discount_subtotal ?? 0,
                currency_code,
              })}
            </span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="flex gap-x-1 items-center ">Taxes</span>
          <span data-testid="cart-taxes" data-value={tax_total || 0}>
            {convertToLocale({ amount: tax_total ?? 0, currency_code })}
          </span>
        </div>
      </div>
      <div className="h-px w-full border-b border-grey-20 my-4" />
      <div className="flex items-center justify-between text-ui-fg-base mb-2 txt-medium ">
        <span>Total</span>
        <span
          className=" text-2xl font-bold text-green-600"
          data-testid="cart-total"
          data-value={displayTotal}
        >
          {convertToLocale({ amount: displayTotal, currency_code })}
        </span>
      </div>
      <div className="h-px w-full border-b border-grey-20 my-4" />
      <div className="font-medium w-full text-sm text-center">
        You will get delivery<br /><span className="font-semibold text-lg text-green-500">within {deliveryDays} Days</span> after confirmation
      </div>
      <div className="h-px w-full border-b border-grey-20 mt-4" />
    </div>
  )
}

export default CartTotals
