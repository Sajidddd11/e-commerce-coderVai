import { clx } from "@medusajs/ui"

import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import ResponsivePrice from "@modules/common/components/responsive-price"

export default function ProductPrice({
  product,
  variant,
}: {
  product: HttpTypes.StoreProduct
  variant?: HttpTypes.StoreProductVariant
}) {
  const { cheapestPrice, variantPrice } = getProductPrice({
    product,
    variantId: variant?.id,
  })

  const selectedPrice = variant ? variantPrice : cheapestPrice

  if (!selectedPrice) {
    return <div className="block w-32 h-9 bg-gray-100 animate-pulse" />
  }

  const hasValidDiscount =
    selectedPrice.price_type === "sale" &&
    typeof selectedPrice.percentage_diff !== "undefined" &&
    Number(selectedPrice.percentage_diff) > 0 &&
    selectedPrice.original_price_number >
    selectedPrice.calculated_price_number

  return (
    <div className="flex flex-col text-ui-fg-base">
      <div
        data-testid="product-price"
        data-value={selectedPrice.calculated_price_number}
      >
        <ResponsivePrice
          formattedPrice={selectedPrice.calculated_price}
          baseClassName="text-3xl small:text-4xl font-bold text-slate-900"
        />
      </div>
      {hasValidDiscount && (
        <>
          <p>
            <span className="text-ui-fg-subtle">Original: </span>
            <span
              className="line-through"
              data-testid="original-product-price"
              data-value={selectedPrice.original_price_number}
            >
              {selectedPrice.original_price}
            </span>
          </p>
          <span className="text-ui-fg-interactive">
            -{selectedPrice.percentage_diff}%
          </span>
        </>
      )}
    </div>
  )
}
