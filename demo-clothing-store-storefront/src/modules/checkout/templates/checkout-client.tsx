"use client"

import { useState } from "react"
import { HttpTypes } from "@medusajs/types"
import ConsolidatedCheckoutForm from "@modules/checkout/components/consolidated-checkout-form"
import CheckoutSummary from "@modules/checkout/templates/checkout-summary"

type CheckoutClientProps = {
    cart: HttpTypes.StoreCart
    customer: HttpTypes.StoreCustomer | null
}

export default function CheckoutClient({ cart, customer }: CheckoutClientProps) {
    const [selectedShippingCost, setSelectedShippingCost] = useState<number | undefined>(undefined)
    const [selectedDistrict, setSelectedDistrict] = useState<string>("")

    // Create a modified cart object with the updated shipping address for display purposes
    const displayCart = selectedDistrict
        ? {
            ...cart,
            shipping_address: {
                ...cart.shipping_address,
                city: selectedDistrict,
            },
        }
        : cart

    return (
        <div className="grid grid-cols-1 small:grid-cols-[1fr_380px] gap-6 small:gap-8">
            <div>
                <ConsolidatedCheckoutForm
                    cart={cart}
                    customer={customer}
                    onShippingCostChange={setSelectedShippingCost}
                    onDistrictChange={setSelectedDistrict}
                />
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-5 small:p-6 h-fit sticky top-20 small:top-24">
                <CheckoutSummary cart={displayCart} shippingOverride={selectedShippingCost} />
            </div>
        </div>
    )
}
