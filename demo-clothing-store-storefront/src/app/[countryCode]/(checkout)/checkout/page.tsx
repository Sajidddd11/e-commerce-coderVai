import { retrieveCart } from "@lib/data/cart"
import { retrieveCustomer } from "@lib/data/customer"
import Review from "@modules/checkout/components/review"
import CheckoutSummary from "@modules/checkout/templates/checkout-summary"
import CheckoutClient from "@modules/checkout/templates/checkout-client"
import { Metadata } from "next"
import { notFound } from "next/navigation"

export const metadata: Metadata = {
  title: "Checkout",
}

export default async function Checkout({
  searchParams,
}: {
  searchParams: Promise<{ step?: string }>
}) {
  const cart = await retrieveCart()

  if (!cart) {
    return notFound()
  }

  const customer = await retrieveCustomer()
  const params = await searchParams
  const isReviewStep = params.step === "review"

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <div className="content-container py-6 small:py-12">
        <h1 className="text-2xl small:text-4xl font-bold text-slate-900 mb-6 small:mb-8">
          Checkout
        </h1>
        {isReviewStep ? (
          <div className="flex flex-col-reverse small:grid small:grid-cols-2 gap-6 small:gap-8">
            <div className="">
              <Review cart={cart} />
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-5 small:p-6 h-fit small:sticky top-20 small:top-24">
              <CheckoutSummary cart={cart} showDiscountCode={false} />
            </div>
          </div>
        ) : (
          <CheckoutClient cart={cart} customer={customer} />
        )}
      </div>
    </div>
  )
}
