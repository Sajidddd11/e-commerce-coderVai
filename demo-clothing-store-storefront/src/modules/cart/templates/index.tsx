import ItemsTemplate from "./items"
import Summary from "./summary"
import EmptyCartMessage from "../components/empty-cart-message"
import SignInPrompt from "../components/sign-in-prompt"
import Divider from "@modules/common/components/divider"
import { HttpTypes } from "@medusajs/types"

const CartTemplate = ({
  cart,
  customer,
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <div className="content-container py-6 small:py-8 medium:py-12" data-testid="cart-container">
        <h1 className="text-2xl small:text-3xl medium:text-4xl font-bold text-slate-900 mb-6 small:mb-8">
          Shopping Cart
        </h1>
        {cart?.items?.length ? (
          <div className="grid grid-cols-1 medium:grid-cols-[1fr_380px] gap-6 small:gap-8">
            <div className="flex flex-col gap-4 small:gap-6 order-1">
              {!customer && (
                <>
                  <SignInPrompt />
                  <Divider />
                </>
              )}
              <ItemsTemplate cart={cart} />
            </div>
            <div className="relative order-2">
              <div className="flex flex-col gap-y-4 small:gap-y-6 sticky top-20 small:top-24 bg-white rounded-lg border border-slate-200 p-4 small:p-6">
                {cart && cart.region && (
                  <Summary cart={cart as any} />
                )}
              </div>
            </div>
          </div>
        ) : (
          <div>
            <EmptyCartMessage />
          </div>
        )}
      </div>
    </div>
  )
}

export default CartTemplate
