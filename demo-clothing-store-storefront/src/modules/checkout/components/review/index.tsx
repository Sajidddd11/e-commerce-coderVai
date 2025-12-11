"use client"

import { Heading, Text, clx } from "@medusajs/ui"
import PaymentButton from "../payment-button"
import { useSearchParams, useRouter, usePathname } from "next/navigation"

const Review = ({ cart }: { cart: any }) => {
    const searchParams = useSearchParams()
    const router = useRouter()
    const pathname = usePathname()

    const isOpen = searchParams.get("step") === "review"

    const paidByGiftcard =
        cart?.gift_cards && cart?.gift_cards?.length > 0 && cart?.total === 0

    const previousStepsCompleted =
        cart.shipping_address &&
        cart.shipping_methods.length > 0 &&
        (cart.payment_collection || paidByGiftcard)

    const handleEdit = () => {
        router.push(pathname)
    }

    return (
        <div className="bg-white rounded-lg border border-slate-200 p-6 small:p-8">
            {/* Header Section */}
            <div className="flex flex-row items-center justify-between mb-8 pb-6 border-b border-slate-200">
                <Heading
                    level="h2"
                    className={clx(
                        "text-2xl small:text-3xl font-bold text-slate-900",
                        {
                            "opacity-50 pointer-events-none select-none": !isOpen,
                        }
                    )}
                >
                    Review Your Order
                </Heading>
                {isOpen && previousStepsCompleted && (
                    <button
                        onClick={handleEdit}
                        className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
                        data-testid="edit-checkout-button"
                    >
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 19l-7-7 7-7"
                            />
                        </svg>
                        Edit
                    </button>
                )}
            </div>

            {/* Content Section */}
            {isOpen && previousStepsCompleted && (
                <div className="space-y-6">
                    {/* Terms & Conditions */}
                    <div className="bg-slate-50 rounded-lg p-5 border border-slate-200">
                        <Text className="text-sm text-slate-700 leading-relaxed">
                            By clicking "Place Order", you confirm that you have read and accept our{" "}
                            <a href="/terms-of-service" className="text-blue-600 hover:underline">
                                Terms of Use
                            </a>
                            ,{" "}
                            <a href="/terms-of-service" className="text-blue-600 hover:underline">
                                Terms of Sale
                            </a>
                            ,{" "}
                            <a href="/returns" className="text-blue-600 hover:underline">
                                Returns Policy
                            </a>
                            , and{" "}
                            <a href="/privacy-policy" className="text-blue-600 hover:underline">
                                Privacy Policy
                            </a>
                            .
                        </Text>
                    </div>

                    {/* Payment Button */}
                    <PaymentButton cart={cart} data-testid="submit-order-button" />
                </div>
            )}
        </div>
    )
}

export default Review
