"use client"

import { isManual, isStripeLike, isSslCommerz } from "@lib/constants"
import { placeOrder } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import { useElements, useStripe } from "@stripe/react-stripe-js"
import React, { useState } from "react"
import ErrorMessage from "../error-message"
import LoadingButton from "@modules/common/components/loading-button"
import { Button } from "@medusajs/ui"

type PaymentButtonProps = {
  cart: HttpTypes.StoreCart
  "data-testid": string
}

const PaymentButton: React.FC<PaymentButtonProps> = ({
  cart,
  "data-testid": dataTestId,
}) => {
  const notReady =
    !cart ||
    !cart.shipping_address ||
    !cart.billing_address ||
    !cart.email ||
    (cart.shipping_methods?.length ?? 0) < 1

  const paymentSession = cart.payment_collection?.payment_sessions?.[0]

  switch (true) {
    case isStripeLike(paymentSession?.provider_id):
      return (
        <StripePaymentButton
          notReady={notReady}
          cart={cart}
          data-testid={dataTestId}
        />
      )
    case isSslCommerz(paymentSession?.provider_id):
      return (
        <SSLCommerzPaymentButton
          notReady={notReady}
          cart={cart}
          data-testid={dataTestId}
        />
      )
    case isManual(paymentSession?.provider_id):
      return (
        <ManualTestPaymentButton notReady={notReady} data-testid={dataTestId} />
      )
    default:
      return <Button disabled>Select a payment method</Button>
  }
}

const StripePaymentButton = ({
  cart,
  notReady,
  "data-testid": dataTestId,
}: {
  cart: HttpTypes.StoreCart
  notReady: boolean
  "data-testid"?: string
}) => {
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const onPaymentCompleted = async () => {
    await placeOrder()
      .catch((err) => {
        setErrorMessage(err.message)
      })
      .finally(() => {
        setSubmitting(false)
      })
  }

  const stripe = useStripe()
  const elements = useElements()
  const card = elements?.getElement("card")

  const session = cart.payment_collection?.payment_sessions?.find(
    (s) => s.status === "pending"
  )

  const disabled = !stripe || !elements ? true : false

  const handlePayment = async () => {
    setSubmitting(true)

    if (!stripe || !elements || !card || !cart) {
      setSubmitting(false)
      return
    }

    await stripe
      .confirmCardPayment(session?.data.client_secret as string, {
        payment_method: {
          card: card,
          billing_details: {
            name:
              cart.billing_address?.first_name +
              " " +
              cart.billing_address?.last_name,
            address: {
              city: cart.billing_address?.city ?? undefined,
              country: cart.billing_address?.country_code ?? undefined,
              line1: cart.billing_address?.address_1 ?? undefined,
              line2: cart.billing_address?.address_2 ?? undefined,
              postal_code: cart.billing_address?.postal_code ?? undefined,
              state: cart.billing_address?.province ?? undefined,
            },
            email: cart.email,
            phone: cart.billing_address?.phone ?? undefined,
          },
        },
      })
      .then(({ error, paymentIntent }) => {
        if (error) {
          const pi = error.payment_intent

          if (
            (pi && pi.status === "requires_capture") ||
            (pi && pi.status === "succeeded")
          ) {
            onPaymentCompleted()
          }

          setErrorMessage(error.message || null)
          return
        }

        if (
          (paymentIntent && paymentIntent.status === "requires_capture") ||
          paymentIntent.status === "succeeded"
        ) {
          return onPaymentCompleted()
        }

        return
      })
  }

  return (
    <>
      <LoadingButton
        disabled={disabled || notReady}
        onClick={handlePayment}
        size="large"
        isLoading={submitting}
        data-testid={dataTestId}
      >
        Place order
      </LoadingButton>
      <ErrorMessage
        error={errorMessage}
        data-testid="stripe-payment-error-message"
      />
    </>
  )
}

const SSLCommerzPaymentButton = ({
  cart,
  notReady,
  "data-testid": dataTestId,
}: {
  cart: HttpTypes.StoreCart
  notReady: boolean
  "data-testid"?: string
}) => {
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handlePayment = async () => {
    setSubmitting(true)
    setErrorMessage(null)

    try {
      // Find the SSLCommerz payment session
      const sslSession = cart.payment_collection?.payment_sessions?.find(
        (session: any) => isSslCommerz(session.provider_id)
      )

      if (!sslSession) {
        throw new Error("SSLCommerz payment session not found. Please select a payment method.")
      }

      const gatewayUrl = sslSession?.data?.gateway_url as string | undefined
      const selectedGateway = sslSession?.data?.selected_gateway as string | undefined
      const gatewayList = (sslSession?.data?.gateway_list || []) as any[]

      if (!gatewayUrl) {
        throw new Error(
          "Unable to retrieve SSLCommerz gateway URL. Please try again."
        )
      }

      // Store cart ID in localStorage before redirecting (as backup)
      if (cart?.id) {
        localStorage.setItem("_medusa_cart_id_ssl", cart.id)
        console.log(`[SSLCommerz] Stored cart ID in localStorage: ${cart.id}`)
      }

      let redirectUrl = gatewayUrl

      // If a specific gateway was selected (bkash or nagad), try to find its direct URL
      if (selectedGateway && gatewayList.length > 0) {
        console.log(`[SSLCommerz] Looking for ${selectedGateway} in gateway list...`)
        console.log(`[SSLCommerz] Gateway list:`, gatewayList)

        // Find the gateway with matching 'gw' field
        const gateway = gatewayList.find((gw: any) => gw.gw === selectedGateway)

        if (gateway?.redirectGatewayURL) {
          redirectUrl = gateway.redirectGatewayURL
          console.log(`[SSLCommerz] Found direct ${selectedGateway} URL: ${redirectUrl}`)
        } else {
          console.log(`[SSLCommerz] No redirectGatewayURL found for ${selectedGateway}, using default gateway page`)
        }
      } else {
        console.log(`[SSLCommerz] No specific gateway selected, using default gateway page`)
      }

      console.log(`[SSLCommerz] Redirecting to: ${redirectUrl}`)

      // Redirect to the selected gateway
      window.location.href = redirectUrl
    } catch (err: any) {
      setErrorMessage(err.message)
      setSubmitting(false)
    }
  }

  return (
    <>
      <LoadingButton
        disabled={notReady}
        isLoading={submitting}
        onClick={handlePayment}
        size="large"
        data-testid={dataTestId}
      >
        Place order
      </LoadingButton>
      <ErrorMessage
        error={errorMessage}
        data-testid="sslcommerz-payment-error-message"
      />
    </>
  )
}

const ManualTestPaymentButton = ({ notReady }: { notReady: boolean }) => {
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const onPaymentCompleted = async () => {
    await placeOrder()
      .catch((err) => {
        setErrorMessage(err.message)
      })
      .finally(() => {
        setSubmitting(false)
      })
  }

  const handlePayment = () => {
    setSubmitting(true)

    onPaymentCompleted()
  }

  return (
    <>
      <LoadingButton
        disabled={notReady}
        isLoading={submitting}
        onClick={handlePayment}
        size="large"
        data-testid="submit-order-button"
      >
        Place order
      </LoadingButton>
      <ErrorMessage
        error={errorMessage}
        data-testid="manual-payment-error-message"
      />
    </>
  )
}

export default PaymentButton
