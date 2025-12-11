import { Heading } from "@medusajs/ui"

import ItemsPreviewTemplate from "@modules/cart/templates/preview"
import DiscountCode from "@modules/checkout/components/discount-code"
import CartTotals from "@modules/common/components/cart-totals"
import Divider from "@modules/common/components/divider"

const CheckoutSummary = ({ cart, shippingOverride, showDiscountCode = true }: { cart: any; shippingOverride?: number; showDiscountCode?: boolean }) => {
  return (
    <div className="flex flex-col-reverse small:flex-col gap-y-6 small:gap-y-8 py-6 small:py-0">
      <div className="w-full bg-white flex flex-col">
        <Divider className="my-4 small:my-6 small:hidden" />
        <Heading
          level="h2"
          className="flex flex-row text-2xl small:text-3xl-regular items-baseline"
        >
          In your Cart
        </Heading>
        <Divider className="my-4 small:my-6" />
        <CartTotals totals={cart} shippingOverride={shippingOverride} />
        <ItemsPreviewTemplate cart={cart} />
        {showDiscountCode && (
          <div className="my-4 small:my-6">
            <DiscountCode cart={cart} />
          </div>
        )}
      </div>
    </div>
  )
}

export default CheckoutSummary
