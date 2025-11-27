import SSLCommerzPayment from "sslcommerz-lts"

const REQUIRED_CREDENTIAL_ENV_VARS = ["SSL_STORE_ID", "SSL_STORE_PASSWORD"] as const
const REQUIRED_CALLBACK_ENV_VARS = [
  "SSL_SUCCESS_URL",
  "SSL_FAIL_URL",
  "SSL_CANCEL_URL",
] as const

const getRequiredEnv = (key: string): string => {
  const value = process.env[key]
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`)
  }

  return value
}

const resolveMode = () => {
  const mode = (process.env.SSL_MODE || "sandbox").toLowerCase()
  return mode === "live"
}

export const getSslCommerzClient = () => {
  REQUIRED_CREDENTIAL_ENV_VARS.forEach(getRequiredEnv)

  const storeId = process.env.SSL_STORE_ID!
  const storePassword = process.env.SSL_STORE_PASSWORD!

  return new SSLCommerzPayment(storeId, storePassword, resolveMode())
}

export const getCallbackUrls = () => {
  REQUIRED_CALLBACK_ENV_VARS.forEach(getRequiredEnv)

  return {
    success_url: process.env.SSL_SUCCESS_URL!,
    fail_url: process.env.SSL_FAIL_URL!,
    cancel_url: process.env.SSL_CANCEL_URL!,
    ipn_url: process.env.SSL_IPN_URL || undefined,
  }
}

export const withDefaultTransactionData = <T extends Record<string, any>>(data: T) => {
  const defaults = {
    currency: process.env.SSL_CURRENCY || "BDT",
    product_name: process.env.SSL_PRODUCT_NAME || "Medusa Order",
    product_category: process.env.SSL_PRODUCT_CATEGORY || "General",
    product_profile: process.env.SSL_PRODUCT_PROFILE || "general",
    shipping_method: process.env.SSL_SHIPPING_METHOD || "Courier",
    ...getCallbackUrls(),
  }

  return {
    ...defaults,
    ...data,
  }
}

