import { useEffect, useState } from "react"
import { View, ScrollView, Pressable, StyleSheet, ActivityIndicator } from "react-native"
import { Image } from "expo-image"
import { useLocalSearchParams, useRouter } from "expo-router"
import {
  ChevronLeft,
  Clock,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  RefreshCw,
  Check,
} from "lucide-react-native"
import { HttpTypes } from "@medusajs/types"
import { Screen } from "@components/layout/Screen"
import { ThemedText } from "@components/ui/ThemedText"
import { retrieveOrder } from "@api/orders"
import { paymentTitle } from "@utils/shipping"
import { convertToLocale } from "@utils/money"
import { colors, spacing, borderRadius } from "@design/theme"

// ─── Tracking config ──────────────────────────────────────────────────────────

type TrackingStep = {
  key: string
  label: string
  description: string
  Icon: any
}

const TRACKING_STEPS: TrackingStep[] = [
  {
    key: "pending",
    label: "Order Placed",
    description: "Your order has been received",
    Icon: Clock,
  },
  {
    key: "processing",
    label: "Processing",
    description: "We are preparing your items",
    Icon: Package,
  },
  {
    key: "shipped",
    label: "Shipped",
    description: "Your order is on the way",
    Icon: Truck,
  },
  {
    key: "delivered",
    label: "Delivered",
    description: "Order successfully delivered",
    Icon: CheckCircle,
  },
]

const CANCELLED_STEPS: TrackingStep[] = [
  {
    key: "pending",
    label: "Order Placed",
    description: "Your order was received",
    Icon: Clock,
  },
  {
    key: "canceled",
    label: "Cancelled",
    description: "This order has been cancelled",
    Icon: XCircle,
  },
]

const REFUNDED_STEPS: TrackingStep[] = [
  {
    key: "pending",
    label: "Order Placed",
    description: "Your order was received",
    Icon: Clock,
  },
  {
    key: "refunded",
    label: "Refunded",
    description: "Refund has been processed",
    Icon: RefreshCw,
  },
]

function getStepsForStatus(status: string) {
  if (status === "canceled") return CANCELLED_STEPS
  if (status === "refunded") return REFUNDED_STEPS
  return TRACKING_STEPS
}

function getActiveStepIndex(status: string, steps: TrackingStep[]) {
  const idx = steps.findIndex((s) => s.key === status)
  return idx === -1 ? 0 : idx
}

function getStepColors(status: string) {
  if (status === "canceled") return { active: "#EF4444", muted: "#FEE2E2" }
  if (status === "refunded") return { active: "#F59E0B", muted: "#FEF3C7" }
  if (status === "delivered") return { active: "#10B981", muted: "#D1FAE5" }
  return { active: colors.brand.teal, muted: "rgba(86,174,191,0.12)" }
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const [order, setOrder] = useState<HttpTypes.StoreOrder | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    retrieveOrder(id)
      .then(setOrder)
      .finally(() => setLoading(false))
  }, [id])

  const currency = order?.currency_code || "bdt"
  const provider =
    order?.payment_collections?.[0]?.payments?.[0]?.provider_id ?? ""

  const customStatus = (order?.metadata as any)?.custom_status || order?.status || "pending"
  const steps = getStepsForStatus(customStatus)
  const activeIndex = getActiveStepIndex(customStatus, steps)
  const stepColors = getStepColors(customStatus)

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

          {/* ── Tracking card ── */}
          <View style={styles.trackingCard}>
            <ThemedText variant="subheading" color={colors.grey[90]} style={styles.trackingTitle}>
              Order Status
            </ThemedText>

            <View style={styles.stepsContainer}>
              {steps.map((step, index) => {
                const isCompleted = index < activeIndex
                const isActive = index === activeIndex
                const isLast = index === steps.length - 1
                const { Icon } = step

                const dotColor = isCompleted || isActive ? stepColors.active : colors.grey[20]
                const iconColor = isCompleted || isActive ? "#fff" : colors.grey[40]
                const lineColor = isCompleted ? stepColors.active : colors.grey[20]

                return (
                  <View key={step.key} style={styles.stepRow}>
                    {/* Left: dot + line */}
                    <View style={styles.stepLeft}>
                      <View style={[styles.stepDot, { backgroundColor: dotColor }]}>
                        {isCompleted ? (
                          <Check size={12} color="#fff" strokeWidth={3} />
                        ) : (
                          <Icon size={13} color={iconColor} strokeWidth={2.2} />
                        )}
                      </View>
                      {!isLast && (
                        <View style={[styles.stepLine, { backgroundColor: lineColor }]} />
                      )}
                    </View>

                    {/* Right: text */}
                    <View style={[styles.stepContent, !isLast && { paddingBottom: 24 }]}>
                      <ThemedText
                        variant={isActive ? "bodyMedium" : "body"}
                        color={isActive ? stepColors.active : isCompleted ? colors.grey[70] : colors.grey[40]}
                        style={isActive ? styles.activeLabel : undefined}
                      >
                        {step.label}
                      </ThemedText>
                      <ThemedText variant="bodySmall" color={isActive ? colors.grey[60] : colors.grey[40]}>
                        {step.description}
                      </ThemedText>
                    </View>
                  </View>
                )
              })}
            </View>

            {/* Status badge */}
            <View style={[styles.statusBadge, { backgroundColor: stepColors.muted }]}>
              <View style={[styles.statusDot, { backgroundColor: stepColors.active }]} />
              <ThemedText variant="bodySmall" color={stepColors.active} style={styles.statusBadgeText}>
                {customStatus.charAt(0).toUpperCase() + customStatus.slice(1)}
              </ThemedText>
            </View>
          </View>

          {/* ── Items card ── */}
          <View style={styles.card}>
            <ThemedText variant="subheading" color={colors.grey[90]}>
              Items
            </ThemedText>
            {order.items?.map((item) => {
              const handle = item.product?.handle || item.variant?.product?.handle
              const navigateToProduct = () => {
                if (handle) {
                  router.push(`/product/${handle}`)
                }
              }

              return (
                <Pressable
                  key={item.id}
                  style={({ pressed }) => [styles.itemRow, pressed && handle && { opacity: 0.7 }]}
                  disabled={!handle}
                  onPress={navigateToProduct}
                >
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
                </Pressable>
              )
            })}
          </View>

          {/* ── Summary card ── */}
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

          {/* ── Delivery card ── */}
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

        </ScrollView>
      )}
    </Screen>
  )
}

// ─── Row helper ───────────────────────────────────────────────────────────────

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

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  flex: { flex: 1, gap: 2 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.grey[20],
  },
  back: { padding: spacing.xs },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.base },
  scroll: { padding: spacing.base, gap: spacing.base, paddingBottom: spacing.xl },

  // Tracking card
  trackingCard: {
    backgroundColor: colors.grey[0],
    borderWidth: 1,
    borderColor: colors.grey[20],
    borderRadius: borderRadius.rounded,
    padding: spacing.base,
    gap: spacing.md,
  },
  trackingTitle: {
    marginBottom: spacing.xs,
  },
  stepsContainer: {
    gap: 0,
  },
  stepRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  stepLeft: {
    alignItems: "center",
    width: 32,
  },
  stepDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  stepLine: {
    width: 2,
    flex: 1,
    marginTop: 2,
    minHeight: 20,
    borderRadius: 1,
  },
  stepContent: {
    flex: 1,
    paddingTop: 6,
    gap: 2,
  },
  activeLabel: {
    fontWeight: "700",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    marginTop: spacing.xs,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  statusBadgeText: {
    fontWeight: "600",
    fontSize: 12,
  },

  // General cards
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
