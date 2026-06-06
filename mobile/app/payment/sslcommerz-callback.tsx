import { useEffect, useRef, useState } from "react"
import { View, StyleSheet, ActivityIndicator } from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import { XCircle } from "lucide-react-native"
import { Screen } from "@components/layout/Screen"
import { ThemedText } from "@components/ui/ThemedText"
import { Button } from "@components/ui/Button"
import { useCartStore } from "@stores/cart-store"
import { useCheckoutStore } from "@stores/checkout-store"
import {
  completeOrderAfterSSLCommerz,
  getCartIdFromSession,
} from "@api/sslcommerz"
import { retrieveCart, getCartId } from "@api/cart"
import { storage, STORAGE_KEYS } from "@utils/storage"
import { colors, spacing } from "@design/theme"

type Status = "processing" | "error"

export default function SslCommerzCallbackScreen() {
  const params = useLocalSearchParams<{
    ssl_status?: string
    ssl_tran_id?: string
    session_id?: string
    cart_id?: string
  }>()
  const router = useRouter()
  const setCart = useCartStore((s) => s.setCart)
  const resetForm = useCheckoutStore((s) => s.reset)

  const [status, setStatus] = useState<Status>("processing")
  const [message, setMessage] = useState("Confirming your payment…")
  const ran = useRef(false)

  useEffect(() => {
    if (ran.current) return
    ran.current = true

    const run = async () => {
      const sslStatus = params.ssl_status ?? "success"

      if (sslStatus === "failed") {
        setStatus("error")
        setMessage("Payment failed. Please try again.")
        return
      }
      if (sslStatus === "cancelled") {
        setStatus("error")
        setMessage("Payment was cancelled.")
        return
      }

      const tranId = params.ssl_tran_id || params.session_id

      // Resolve the cart id: url → ssl backup → stored cart → session lookup
      let cartId =
        params.cart_id ||
        (await storage.get(STORAGE_KEYS.cartIdSsl)) ||
        (await getCartId())

      if (!cartId && tranId) {
        cartId = await getCartIdFromSession(tranId)
      }

      if (!cartId) {
        setStatus("error")
        setMessage("We could not locate your order. Please check your account.")
        return
      }

      // If the cart already completed, send the user to their orders.
      const existing = await retrieveCart(cartId)
      if (existing && (existing as any).completed_at) {
        await cleanup()
        router.replace("/account/orders")
        return
      }

      const result = await completeOrderAfterSSLCommerz(cartId)
      await cleanup()

      if ("order" in result && result.order) {
        router.replace(`/order/${result.order.id}/confirmed`)
        return
      }
      if (result.success) {
        // Completed but order not retrievable (guest) — go to orders/home.
        router.replace("/account/orders")
        return
      }

      setStatus("error")
      setMessage(result.error ?? "Payment could not be confirmed.")
    }

    const cleanup = async () => {
      await storage.remove(STORAGE_KEYS.cartIdSsl).catch(() => {})
      await storage.remove(STORAGE_KEYS.cartId).catch(() => {})
      await resetForm()
      setCart(null)
    }

    run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Screen>
      <View style={styles.center}>
        {status === "processing" ? (
          <>
            <ActivityIndicator size="large" color={colors.brand.teal} />
            <ThemedText
              variant="body"
              color={colors.grey[60]}
              style={styles.text}
            >
              {message}
            </ThemedText>
          </>
        ) : (
          <>
            <XCircle size={56} color={colors.error} />
            <ThemedText
              variant="subheading"
              color={colors.grey[90]}
              style={styles.text}
            >
              {message}
            </ThemedText>
            <Button
              title="Back to Checkout"
              onPress={() => router.replace("/checkout")}
              style={styles.btn}
            />
          </>
        )}
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.base,
    padding: spacing.xl,
  },
  text: { textAlign: "center" },
  btn: { marginTop: spacing.sm },
})
