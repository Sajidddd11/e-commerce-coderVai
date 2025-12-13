import React from "react"
import { CreditCard } from "@medusajs/icons"

import Ideal from "@modules/common/icons/ideal"
import Bancontact from "@modules/common/icons/bancontact"
import PayPal from "@modules/common/icons/paypal"

/* Map of payment provider_id to their title and icon. Add in any payment providers you want to use. */
export const paymentInfoMap: Record<
  string,
  { title: string; icon: React.JSX.Element }
> = {
  pp_stripe_stripe: {
    title: "Credit card",
    icon: <CreditCard />,
  },
  "pp_medusa-payments_default": {
    title: "Credit card",
    icon: <CreditCard />,
  },
  "pp_stripe-ideal_stripe": {
    title: "iDeal",
    icon: <Ideal />,
  },
  "pp_stripe-bancontact_stripe": {
    title: "Bancontact",
    icon: <Bancontact />,
  },
  pp_paypal_paypal: {
    title: "PayPal",
    icon: <PayPal />,
  },
  pp_system_default: {
    title: "Cash on Delivery",
    icon: (
      <img
        src="/3796142.png"
        alt="Cash on Delivery"
        className="h-8 w-auto object-contain"
      />
    ),
  },
  pp_sslcommerz_default: {
    title: "SSLCommerz",
    icon: (
      <img
        src="/payment logo.png"
        alt="SSLCommerz"
        className="h-8 w-auto object-contain"
      />
    ),
  },
  pp_sslcommerz_default_bkash: {
    title: "bKash",
    icon: (
      <img
        src="/bkash-logo-mobile-banking-app-icon-transparent-background-free-png.webp"
        alt="bKash"
        className="h-8 w-auto object-contain"
      />
    ),
  },
  pp_sslcommerz_default_nagad: {
    title: "Nagad",
    icon: (
      <img
        src="/nagan-logo-mobile-banking-app-icon-transparent-background-free-png.png"
        alt="Nagad"
        className="h-8 w-auto object-contain"
      />
    ),
  },
  // Add more payment providers here
}

// This only checks if it is native stripe or zahan payments for card payments, it ignores the other stripe-based providers
export const isStripeLike = (providerId?: string) => {
  return (
    providerId?.startsWith("pp_stripe_") || providerId?.startsWith("pp_medusa-")
  )
}

/* Social Media Links */
export const socialMediaLinks = {
  facebook: "https://www.facebook.com/zahanfashion",
  instagram: "https://www.instagram.com/zahanfashion",
  youtube: "https://www.youtube.com/@zahanfashion",
}

export const isPaypal = (providerId?: string) => {
  return providerId?.startsWith("pp_paypal")
}
export const isManual = (providerId?: string) => {
  return providerId?.startsWith("pp_system_default")
}
export const isSslCommerz = (providerId?: string) => {
  return providerId?.startsWith("pp_sslcommerz_")
}

// Add currencies that don't need to be divided by 100
export const noDivisionCurrencies = [
  "krw",
  "jpy",
  "vnd",
  "clp",
  "pyg",
  "xaf",
  "xof",
  "bif",
  "djf",
  "gnf",
  "kmf",
  "mga",
  "rwf",
  "xpf",
  "htg",
  "vuv",
  "xag",
  "xdr",
  "xau",
]
