import { useEffect, useState } from "react"
import { View, ScrollView, Pressable, StyleSheet } from "react-native"
import { useRouter } from "expo-router"
import { ChevronLeft } from "lucide-react-native"
import { HttpTypes } from "@medusajs/types"
import { Screen } from "@components/layout/Screen"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { ThemedText } from "@components/ui/ThemedText"
import { Button } from "@components/ui/Button"
import { PaymentIcon } from "@components/checkout/PaymentIcon"
import { useCartStore } from "@stores/cart-store"
import { useCheckoutStore } from "@stores/checkout-store"
import { placeOrder, retrieveCart } from "@api/cart"
import { sendOrderSms } from "@api/orders"
import { paymentTitle } from "@utils/shipping"
import { isManual, isSslCommerz } from "@design/constants"
import { convertToLocale } from "@utils/money"
import { colors, spacing, borderRadius } from "@design/theme"


export default function CheckoutReviewScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const cart = useCartStore((s) => s.cart)
  const setCart = useCartStore((s) => s.setCart)
  const clearCart = useCartStore((s) => s.clear)
  const resetForm = useCheckoutStore((s) => s.reset)

  const [placing, setPlacing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Refresh the cart so we have the latest payment session + addresses.
  useEffect(() => {
    retrieveCart().then((c) => c && setCart(c))
  }, [setCart])

  const currency = cart?.currency_code || "bdt"
  const addr = cart?.shipping_address
  const shippingMethod = cart?.shipping_methods?.[0]

  const session = cart?.payment_collection?.payment_sessions?.find(
    (s) => s.status === "pending"
  )
  const rawProviderId = session?.provider_id ?? ""
  const selectedGateway = (session?.data as any)?.selected_gateway
  const providerId =
    rawProviderId === "pp_sslcommerz_default" && selectedGateway
      ? `${rawProviderId}_${selectedGateway}`
      : rawProviderId

  const placeCodOrder = async () => {
    const result = await placeOrder(cart!.id)
    if (result.type === "order") {
      await sendOrderSms(result.order.id).catch(() => {})
      await clearCart()
      await resetForm()
      router.replace(`/order/${result.order.id}/confirmed`)
      return
    }
    setError("Your order could not be completed. Please try again.")
  }

  const startSslCommerz = () => {
    const data: any = session?.data ?? {}
    const selectedGateway = data.selected_gateway
    const gatewayList: any[] = data.gateway_list ?? []
    let redirectUrl: string | undefined = data.gateway_url

    if (selectedGateway && gatewayList.length > 0) {
      const gw = gatewayList.find((g) => g.gw === selectedGateway)
      if (gw?.redirectGatewayURL) redirectUrl = gw.redirectGatewayURL
    }

    if (!redirectUrl) {
      setError("Payment gateway is unavailable. Please choose another method.")
      return
    }

    // Open SSLCommerz inside the app using an in-app WebView.
    // The WebView intercepts the backend callback URL and routes to the handler screen.
    router.push(
      `/payment/sslcommerz-webview?url=${encodeURIComponent(redirectUrl)}&cartId=${cart?.id ?? ""}`
    )
  }

  const onPlaceOrder = async () => {
    if (!cart?.id) return
    setError(null)
    setPlacing(true)
    try {
      if (isManual(providerId)) {
        await placeCodOrder()
      } else if (isSslCommerz(providerId)) {
        await startSslCommerz()
      } else {
        setError("No payment method selected. Please go back and choose one.")
      }
    } catch (e: any) {
      setError(e?.message ?? "Something went wrong placing your order.")
    } finally {
      setPlacing(false)
    }
  }

  if (!cart) {
    return (
      <Screen edges={["top"]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.back} hitSlop={8}>
            <ChevronLeft size={24} color={colors.grey[90]} />
          </Pressable>
          <ThemedText variant="sectionHeading" color={colors.grey[90]}>
            Review
          </ThemedText>
        </View>
        <View style={styles.empty}>
          <ThemedText variant="body" color={colors.grey[50]}>
            Your cart is no longer available.
          </ThemedText>
        </View>
      </Screen>
    )
  }

  return (
    <Screen edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.back} hitSlop={8}>
          <ChevronLeft size={24} color={colors.grey[90]} />
        </Pressable>
        <ThemedText variant="sectionHeading" color={colors.grey[90]}>
          Review your order
        </ThemedText>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Items */}
        <Card title="Items">
          {cart.items?.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <ThemedText
                variant="body"
                color={colors.grey[80]}
                style={styles.flex}
                numberOfLines={2}
              >
                {item.quantity}× {item.product_title || item.title}
              </ThemedText>
              <ThemedText variant="bodyMedium" color={colors.grey[90]}>
                {convertToLocale({
                  amount: item.total ?? 0,
                  currency_code: currency,
                })}
              </ThemedText>
            </View>
          ))}
        </Card>

        {/* Shipping address */}
        <Card title="Delivery to" onEdit={() => router.back()}>
          {addr ? (
            <>
              <ThemedText variant="bodyMedium" color={colors.grey[90]}>
                {addr.first_name} {addr.last_name}
              </ThemedText>
              <ThemedText variant="body" color={colors.grey[60]}>
                {addr.address_1}
              </ThemedText>
              <ThemedText variant="body" color={colors.grey[60]}>
                {addr.city}
              </ThemedText>
              <ThemedText variant="body" color={colors.grey[60]}>
                {addr.phone}
              </ThemedText>
              <ThemedText variant="body" color={colors.grey[60]}>
                {cart.email}
              </ThemedText>
            </>
          ) : (
            <ThemedText variant="body" color={colors.grey[50]}>
              No address set.
            </ThemedText>
          )}
        </Card>

        {/* Shipping method */}
        <Card title="Delivery option" onEdit={() => router.back()}>
          <View style={styles.itemRow}>
            <ThemedText variant="body" color={colors.grey[80]} style={styles.flex}>
              {shippingMethod?.name ?? "—"}
            </ThemedText>
            <ThemedText variant="bodyMedium" color={colors.grey[90]}>
              {convertToLocale({
                amount: shippingMethod?.amount ?? 0,
                currency_code: currency,
              })}
            </ThemedText>
          </View>
        </Card>

        {/* Payment */}
        <Card title="Payment" onEdit={() => router.back()}>
          <View style={styles.paymentRow}>
            {providerId ? <PaymentIcon providerId={providerId} /> : null}
            <ThemedText variant="body" color={colors.grey[80]}>
              {providerId ? paymentTitle(providerId) : "No payment method"}
            </ThemedText>
          </View>
        </Card>

        {/* Totals */}
        <Card title="Summary">
          <Row
            label="Subtotal"
            value={convertToLocale({
              amount: cart.item_subtotal ?? cart.subtotal ?? 0,
              currency_code: currency,
            })}
          />
          <Row
            label="Shipping"
            value={convertToLocale({
              amount: cart.shipping_total ?? 0,
              currency_code: currency,
            })}
          />
          {cart.discount_total ? (
            <Row
              label="Discount"
              value={`-${convertToLocale({
                amount: cart.discount_total,
                currency_code: currency,
              })}`}
              valueColor={colors.sale}
            />
          ) : null}
          <View style={styles.divider} />
          <Row
            label="Total"
            value={convertToLocale({
              amount: cart.total ?? 0,
              currency_code: currency,
            })}
            bold
          />
        </Card>

        {error ? (
          <ThemedText variant="bodySmall" color={colors.error} style={styles.error}>
            {error}
          </ThemedText>
        ) : null}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing.base) }]}>
        <Button
          title={isSslCommerz(providerId) ? "Pay Now" : "Place Order"}
          fullWidth
          loading={placing}
          disabled={!providerId}
          onPress={onPlaceOrder}
        />
      </View>
    </Screen>
  )
}

function Card({
  title,
  children,
  onEdit,
}: {
  title: string
  children: React.ReactNode
  onEdit?: () => void
}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <ThemedText variant="subheading" color={colors.grey[90]}>
          {title}
        </ThemedText>
        {onEdit ? (
          <Pressable onPress={onEdit} hitSlop={8}>
            <ThemedText variant="bodySmall" color={colors.brand.teal}>
              Edit
            </ThemedText>
          </Pressable>
        ) : null}
      </View>
      <View style={styles.cardBody}>{children}</View>
    </View>
  )
}

function Row({
  label,
  value,
  bold,
  valueColor,
}: {
  label: string
  value: string
  bold?: boolean
  valueColor?: string
}) {
  return (
    <View style={styles.itemRow}>
      <ThemedText
        variant={bold ? "subheading" : "body"}
        color={colors.grey[bold ? 90 : 60]}
      >
        {label}
      </ThemedText>
      <ThemedText
        variant={bold ? "subheading" : "bodyMedium"}
        color={valueColor ?? colors.grey[90]}
      >
        {value}
      </ThemedText>
    </View>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: 4, // reduced
    paddingBottom: 8, // reduced
    borderBottomWidth: 1,
    borderBottomColor: colors.grey[20],
  },
  back: { padding: spacing.xs },
  scroll: { padding: spacing.base, gap: spacing.base, paddingBottom: spacing.xl },
  card: {
    backgroundColor: colors.grey[0],
    borderWidth: 1,
    borderColor: colors.grey[20],
    borderRadius: borderRadius.rounded,
    padding: spacing.base,
    gap: spacing.sm,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardBody: { gap: spacing.xs },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  paymentRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  divider: {
    height: 1,
    backgroundColor: colors.grey[20],
    marginVertical: spacing.xs,
  },
  error: { marginTop: spacing.xs },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.grey[20],
    padding: spacing.base,
    backgroundColor: colors.grey[0],
  },
  empty: { flex: 1, alignItems: "center", justifyContent: "center" },
})
