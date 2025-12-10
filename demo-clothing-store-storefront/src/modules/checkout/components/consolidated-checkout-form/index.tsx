"use client"

import { CheckCircleSolid } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import { Heading, Text } from "@medusajs/ui"
import { useActionState, useEffect, useState } from "react"
import { prepareCheckout } from "@lib/data/checkout"
import { listCartShippingMethods } from "@lib/data/fulfillment"
import { listCartPaymentMethods } from "@lib/data/payment"
import ShippingAddress from "@modules/checkout/components/shipping-address"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import Divider from "@modules/common/components/divider"
import { Radio, RadioGroup } from "@headlessui/react"
import MedusaRadio from "@modules/common/components/radio"
import { convertToLocale } from "@lib/util/money"
import { clx } from "@medusajs/ui"
import { isStripeLike, paymentInfoMap } from "@lib/constants"
import PaymentContainer, {
    StripeCardContainer,
} from "@modules/checkout/components/payment-container"


type ConsolidatedCheckoutFormProps = {
    cart: HttpTypes.StoreCart
    customer: HttpTypes.StoreCustomer | null
    onShippingCostChange?: (cost: number) => void
}

export default function ConsolidatedCheckoutForm({
    cart,
    customer,
    onShippingCostChange,
}: ConsolidatedCheckoutFormProps) {
    const [message, formAction] = useActionState(prepareCheckout, null)
    const [shippingMethods, setShippingMethods] = useState<
        HttpTypes.StoreCartShippingOption[] | null
    >(null)
    const [paymentMethods, setPaymentMethods] = useState<any[] | null>(null)
    const [selectedShippingMethod, setSelectedShippingMethod] = useState<string>("")
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
        string | null
    >(null)
    const [cardComplete, setCardComplete] = useState(false)
    const [selectedShippingCost, setSelectedShippingCost] = useState<number>(0)
    const [deliveryType, setDeliveryType] = useState<"home" | "pickup">("home")
    const [selectedDistrict, setSelectedDistrict] = useState<string>("")

    // Restore form state from localStorage on mount (for coupon application refreshes)
    useEffect(() => {
        const savedState = localStorage.getItem('checkout_form_state')
        if (savedState) {
            try {
                const parsed = JSON.parse(savedState)
                if (parsed.selectedShippingMethod) setSelectedShippingMethod(parsed.selectedShippingMethod)
                if (parsed.selectedPaymentMethod) setSelectedPaymentMethod(parsed.selectedPaymentMethod)
                if (parsed.selectedShippingCost) {
                    setSelectedShippingCost(parsed.selectedShippingCost)
                    onShippingCostChange?.(parsed.selectedShippingCost)
                }
            } catch (e) {
                console.error('Failed to restore form state:', e)
            }
        }
    }, [])

    // Save form state to localStorage whenever selections change
    useEffect(() => {
        if (selectedShippingMethod || selectedPaymentMethod) {
            localStorage.setItem('checkout_form_state', JSON.stringify({
                selectedShippingMethod,
                selectedPaymentMethod,
                selectedShippingCost,
            }))
        }
    }, [selectedShippingMethod, selectedPaymentMethod, selectedShippingCost])

    // Fetch shipping and payment methods on mount
    useEffect(() => {
        const fetchMethods = async () => {
            const [shipping, payment] = await Promise.all([
                listCartShippingMethods(cart.id),
                listCartPaymentMethods(cart.region?.id ?? ""),
            ])
            setShippingMethods(shipping)
            setPaymentMethods(payment)
        }
        fetchMethods()
    }, [cart.id, cart.region?.id])

    // Auto-select shipping method based on delivery type and district
    useEffect(() => {
        if (!shippingMethods || shippingMethods.length === 0) return

        let methodToSelect: string | null = null

        if (deliveryType === "pickup") {
            // Select "Collect From Store" method
            const pickupMethod = shippingMethods.find(m =>
                m.name?.toLowerCase().includes("collect from store") ||
                m.name?.toLowerCase().includes("pickup") ||
                m.name?.toLowerCase().includes("store")
            )
            if (pickupMethod) {
                methodToSelect = pickupMethod.id
            }
        } else if (deliveryType === "home" && selectedDistrict) {
            // Select based on district
            const isDhaka = selectedDistrict.toLowerCase() === "dhaka"
            const targetMethod = shippingMethods.find(m =>
                isDhaka
                    ? m.name?.toLowerCase().includes("inside dhaka")
                    : m.name?.toLowerCase().includes("outside dhaka")
            )
            if (targetMethod) {
                methodToSelect = targetMethod.id
            }
        }

        if (methodToSelect && methodToSelect !== selectedShippingMethod) {
            handleShippingMethodChange(methodToSelect)
        }
    }, [deliveryType, selectedDistrict, shippingMethods])

    // Handle shipping method change with optimistic UI update
    const handleShippingMethodChange = (shippingMethodId: string) => {
        setSelectedShippingMethod(shippingMethodId)

        // Find the selected shipping method to get its cost
        const selectedMethod = shippingMethods?.find(m => m.id === shippingMethodId)
        if (selectedMethod) {
            // Instantly update the UI with the new shipping cost
            const shippingCost = selectedMethod.amount || 0
            setSelectedShippingCost(shippingCost)
            // Notify parent component for cart summary update
            onShippingCostChange?.(shippingCost)
        }

        // Note: We don't update backend here to avoid page refresh clearing form fields
        // The shipping method will be submitted along with address and payment
        // when user clicks "Continue to Review"
    }

    const isFormValid =
        selectedShippingMethod &&
        selectedPaymentMethod &&
        (!isStripeLike(selectedPaymentMethod) || cardComplete)

    return (
        <form action={formAction} className="w-full">
            {/* Section 1: Addresses */}
            <div className="bg-white mb-6">
                <Heading
                    level="h2"
                    className="flex flex-row text-3xl-regular gap-x-2 items-baseline mb-6"
                >
                    Shipping Address
                </Heading>

                <div className="pb-8">
                    <ShippingAddress
                        customer={customer}
                        checked={true}
                        onChange={() => { }}
                        cart={cart}
                        onDeliveryTypeChange={setDeliveryType}
                        onDistrictChange={setSelectedDistrict}
                    />
                </div>
                <Divider />
            </div>

            {/* Section 2: Shipping Method - Hidden but functional */}
            {/* Hidden input for shipping method */}
            <input
                type="hidden"
                name="shipping_method_id"
                value={selectedShippingMethod || ""}
            />

            {/* Section 3: Payment Method */}
            <div className="bg-white mb-6">
                <Heading
                    level="h2"
                    className="flex flex-row text-3xl-regular gap-x-2 items-baseline mb-6"
                >
                    Payment Method
                </Heading>

                {paymentMethods ? (
                    <div className="pb-8">
                        <RadioGroup
                            value={selectedPaymentMethod}
                            onChange={setSelectedPaymentMethod}
                        >
                            {paymentMethods.map((paymentMethod) => (
                                <div key={paymentMethod.id}>
                                    {isStripeLike(paymentMethod.id) ? (
                                        <StripeCardContainer
                                            paymentProviderId={paymentMethod.id}
                                            selectedPaymentOptionId={selectedPaymentMethod}
                                            paymentInfoMap={paymentInfoMap}
                                            setCardBrand={() => { }}
                                            setError={() => { }}
                                            setCardComplete={setCardComplete}
                                        />
                                    ) : (
                                        <PaymentContainer
                                            paymentInfoMap={paymentInfoMap}
                                            paymentProviderId={paymentMethod.id}
                                            selectedPaymentOptionId={selectedPaymentMethod}
                                        />
                                    )}
                                </div>
                            ))}
                        </RadioGroup>
                        <input
                            type="hidden"
                            name="payment_provider_id"
                            value={selectedPaymentMethod || ""}
                        />
                    </div>
                ) : (
                    <div className="pb-8">
                        <Text className="text-ui-fg-subtle">Loading payment methods...</Text>
                    </div>
                )}
                <Divider />
            </div>

            {/* Error Message */}
            {message && (
                <div className="mb-4">
                    <ErrorMessage error={message} data-testid="checkout-error-message" />
                </div>
            )}

            {/* Submit Button */}
            <SubmitButton
                className="w-full"
                data-testid="submit-checkout-button"
            >
                Continue to Review
            </SubmitButton>
            {!isFormValid && (
                <Text className="text-ui-fg-subtle txt-small mt-2 text-center">
                    Please fill in all required fields and select shipping & payment methods
                </Text>
            )}
        </form>
    )
}
