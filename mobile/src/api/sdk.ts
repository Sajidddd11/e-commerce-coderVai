import Medusa from "@medusajs/js-sdk"

/**
 * Medusa SDK instance — mirrors demo-clothing-store-storefront/src/lib/config.ts
 */
const MEDUSA_BACKEND_URL =
  process.env.EXPO_PUBLIC_MEDUSA_BACKEND_URL ?? "http://localhost:9000"

console.log("[Medusa SDK] Initializing Medusa client...");
console.log("[Medusa SDK] Backend URL:", process.env.EXPO_PUBLIC_MEDUSA_BACKEND_URL);
console.log("[Medusa SDK] Publishable Key:", process.env.EXPO_PUBLIC_MEDUSA_PUBLISHABLE_KEY);

export const sdk = new Medusa({
  baseUrl: MEDUSA_BACKEND_URL,
  debug: __DEV__,
  publishableKey: process.env.EXPO_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
})

;(sdk.client as any).headers = (sdk.client as any).headers || {}
if (process.env.EXPO_PUBLIC_MEDUSA_PUBLISHABLE_KEY) {
  ;(sdk.client as any).headers["x-publishable-api-key"] = process.env.EXPO_PUBLIC_MEDUSA_PUBLISHABLE_KEY
}

export const MEDUSA_BACKEND = MEDUSA_BACKEND_URL
export const PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_MEDUSA_PUBLISHABLE_KEY
export const DEFAULT_REGION = (
  process.env.EXPO_PUBLIC_DEFAULT_REGION ?? "bd"
).toLowerCase()
