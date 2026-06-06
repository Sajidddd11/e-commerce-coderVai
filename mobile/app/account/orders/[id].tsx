import { useEffect, useState } from "react"
import { View, ScrollView, Pressable, StyleSheet, ActivityIndicator } from "react-native"
import { Image } from "expo-image"
import { useLocalSearchParams, useRouter } from "expo-router"
import { ChevronLeft, Send } from "lucide-react-native"
import { HttpTypes } from "@medusajs/types"
import { Screen } from "@components/layout/Screen"
import { ThemedText } from "@components/ui/ThemedText"
import { Button } from "@components/ui/Button"
import { retrieveOrder, createTransferRequest } from "@api/orders"
import { paymentTitle } from "@utils/shipping"
import { convertToLocale } from "@utils/money"
import { colors, spacing, borderRadius } from "@design/theme"

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const [order, setOrder] = useState<HttpTypes.StoreOrder | null>(null)
  const [loading, setLoading] = useState(true)
  const [transferState, setTransferState] = useState<{
    loading: boolean
    message: string | null
    error: boolean
  }>({ loading: false, message: null, error: false })

  useEffect(() => {
    if (!id) return
    retrieveOrder(id)
      .then(setOrder)
      .finally(() => setLoading(false))
  }, [id])

  const currency = order?.currency_code || "bdt"
  const provider =
    order?.payment_collections?.[0]?.payments?.[0]?.provider_id ?? ""

  const requestTransfer = async () => {
    if (!order) return
    setTransferState({ loading: true, message: null, error: false })
    const res = await createTransferRequest(order.id)
    setTransferState({
      loading: false,
      error: !res.success,
      message: res.success
        ? `Transfer request sent to ${res.order?.email ?? "the account email"}.`
        : res.error ?? "Could not request transfer.",
    })
  }

  return (
    <Screen edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.back} hitSlop={8}>
          <ChevronLeft size={24} color={colors.grey[90]} />
        </Pressable>
        <ThemedText variant="sectionHeading" color={colors.grey[90]}>
          {order ? `Order #${order.display_id}` : "Order"}
        </ThemedText>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.brand.teal} />
        </View>
      ) : !order ? (
        <View style={styles.center}>
          <ThemedText variant="body" color={colors.grey[50]}>
            Order not found.
          </ThemedText>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.card}>
            <ThemedText variant="subheading" color={colors.grey[90]}>
              Items
            </ThemedText>
            {order.items?.map((item) => (
              <View key={item.id} style={styles.itemRow}>
                {item.thumbnail ? (
                  <Image source={item.thumbnail} style={styles.thumb} contentFit="cover" />
                ) : null}
                <View style={styles.flex}>
                  <ThemedText variant="body" color={colors.grey[90]} numberOfLines={2}>
                    {item.product_title || item.title}
                  </ThemedText>
                  <ThemedText variant="bodySmall" color={colors.grey[50]}>
                    Qty {item.quantity}
                  </ThemedText>
                </View>
                <ThemedText variant="bodyMedium" color={colors.grey[90]}>
                  {convertToLocale({ amount: item.total ?? 0, currency_code: currency })}
                </ThemedText>
              </View>
            ))}
          </View>

          <View style={styles.card}>
            <ThemedText variant="subheading" color={colors.grey[90]}>
              Summary
            </ThemedText>
            <Row
              label="Subtotal"
              value={convertToLocale({ amount: order.item_subtotal ?? 0, currency_code: currency })}
            />
            <Row
              label="Shipping"
              value={convertToLocale({ amount: order.shipping_total ?? 0, currency_code: currency })}
            />
            {order.discount_total ? (
              <Row
                label="Discount"
                valueColor={colors.sale}
                value={`-${convertToLocale({ amount: order.discount_total, currency_code: currency })}`}
              />
            ) : null}
            <View style={styles.divider} />
            <Row
              label="Total"
              bold
              value={convertToLocale({ amount: order.total ?? 0, currency_code: currency })}
            />
            {provider ? (
              <ThemedText variant="bodySmall" color={colors.grey[50]}>
                {paymentTitle(provider)}
              </ThemedText>
            ) : null}
          </View>

          {order.shipping_address ? (
            <View style={styles.card}>
              <ThemedText variant="subheading" color={colors.grey[90]}>
                Delivery
              </ThemedText>
              <ThemedText variant="body" color={colors.grey[60]}>
                {order.shipping_address.first_name} {order.shipping_address.last_name}
              </ThemedText>
              <ThemedText variant="body" color={colors.grey[60]}>
                {order.shipping_address.address_1}, {order.shipping_address.city}
              </ThemedText>
              <ThemedText variant="body" color={colors.grey[60]}>
                {order.shipping_address.phone}
              </ThemedText>
            </View>
          ) : null}

          <View style={styles.card}>
            <ThemedText variant="subheading" color={colors.grey[90]}>
              Transfer order
            </ThemedText>
            <ThemedText variant="bodySmall" color={colors.grey[50]}>
              Request to transfer this order to the account that owns its email
              address.
            </ThemedText>
            {transferState.message ? (
              <ThemedText
                variant="bodySmall"
                color={transferState.error ? colors.error : colors.success}
              >
                {transferState.message}
              </ThemedText>
            ) : null}
            <Button
              title="Request transfer"
              variant="secondary"
              loading={transferState.loading}
              leftIcon={<Send size={16} color={colors.slate[900]} />}
              onPress={requestTransfer}
            />
          </View>
        </ScrollView>
      )}
    </Screen>
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
      <ThemedText variant={bold ? "subheading" : "body"} color={colors.grey[bold ? 90 : 60]}>
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
  flex: { flex: 1, gap: 2 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.grey[20],
  },
  back: { padding: spacing.xs },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.base },
  scroll: { padding: spacing.base, gap: spacing.base, paddingBottom: spacing.xl },
  card: {
    backgroundColor: colors.grey[0],
    borderWidth: 1,
    borderColor: colors.grey[20],
    borderRadius: borderRadius.rounded,
    padding: spacing.base,
    gap: spacing.sm,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  thumb: { width: 48, height: 48, borderRadius: borderRadius.base, backgroundColor: colors.grey[10] },
  divider: { height: 1, backgroundColor: colors.grey[20], marginVertical: spacing.xs },
})
