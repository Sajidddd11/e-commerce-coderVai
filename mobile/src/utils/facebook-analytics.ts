import { FACEBOOK_PIXEL_ID } from "@design/constants"

/**
 * Lightweight Meta/Facebook event tracking. The web storefront uses the FB
 * Pixel; on mobile we forward standard commerce events. When the native Meta
 * SDK (react-native-fbsdk-next) is installed it will be used automatically;
 * otherwise events are no-ops (logged in dev) so the app still runs in Expo Go.
 */

const PIXEL_ID =
  process.env.EXPO_PUBLIC_FACEBOOK_PIXEL_ID || FACEBOOK_PIXEL_ID

type EventParams = Record<string, string | number | undefined>

// Lazily resolve the optional native module without a hard dependency.
let appEvents: any = null
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  appEvents = require("react-native-fbsdk-next")?.AppEventsLogger ?? null
} catch {
  appEvents = null
}

function track(event: string, params: EventParams) {
  if (appEvents?.logEvent) {
    try {
      appEvents.logEvent(event, params)
      return
    } catch {
      // fall through to dev log
    }
  }
  if (__DEV__) {
    console.log(`[fb-analytics:${PIXEL_ID}] ${event}`, params)
  }
}

export function trackViewContent(params: {
  contentId: string
  contentName?: string
  value?: number
  currency?: string
}) {
  track("ViewContent", {
    fb_content_id: params.contentId,
    fb_content_name: params.contentName,
    _valueToSum: params.value,
    fb_currency: params.currency,
  })
}

export function trackAddToCart(params: {
  contentId: string
  contentName?: string
  value?: number
  currency?: string
}) {
  track("AddToCart", {
    fb_content_id: params.contentId,
    fb_content_name: params.contentName,
    _valueToSum: params.value,
    fb_currency: params.currency,
  })
}

export function trackInitiateCheckout(params: {
  value?: number
  currency?: string
  numItems?: number
}) {
  track("InitiateCheckout", {
    _valueToSum: params.value,
    fb_currency: params.currency,
    fb_num_items: params.numItems,
  })
}

export function trackPurchase(params: {
  orderId: string
  value?: number
  currency?: string
}) {
  track("Purchase", {
    fb_order_id: params.orderId,
    _valueToSum: params.value,
    fb_currency: params.currency,
  })
}
