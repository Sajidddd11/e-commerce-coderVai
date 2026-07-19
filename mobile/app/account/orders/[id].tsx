import { useEffect, useState } from "react"
import {
  View,
  ScrollView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native"
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
  Star,
  X,
  ShieldCheck,
  Loader,
} from "lucide-react-native"
import { HttpTypes } from "@medusajs/types"
import { Screen } from "@components/layout/Screen"
import { ThemedText } from "@components/ui/ThemedText"
import { Button } from "@components/ui/Button"
import { Input } from "@components/ui/Input"
import { retrieveOrder } from "@api/orders"
import { createProductReview, getReviewedProductIds } from "@api/enhancements"
import { useAuthStore } from "@stores/auth-store"
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

// ─── Review Modal ─────────────────────────────────────────────────────────────

interface ReviewItem {
  productId: string
  title: string
  thumbnail?: string | null
}

function ReviewModal({
  item,
  orderId,
  customer,
  onClose,
  onSubmitted,
}: {
  item: ReviewItem
  orderId: string
  customer: { name: string; email: string }
  onClose: () => void
  onSubmitted: () => void
}) {
  const [rating, setRating] = useState(5)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const submit = async () => {
    if (!title.trim() || !content.trim()) {
      setError("Please fill in all fields.")
      return
    }
    setError(null)
    setSubmitting(true)
    const res = await createProductReview(item.productId, {
      rating,
      title,
      content,
      customer_name: customer.name,
      customer_email: customer.email,
      order_id: orderId,
    })
    setSubmitting(false)
    if (res.success) {
      setSubmitted(true)
      setTimeout(() => {
        onSubmitted()
        onClose()
      }, 1800)
    } else {
      setError(res.error ?? "Could not submit review.")
    }
  }

  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior="padding"
        style={styles.modalBackdrop}
      >
        <View style={styles.modalSheet}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <ThemedText variant="subheading" color={colors.grey[90]}>
              Write a review
            </ThemedText>
            <Pressable onPress={onClose} hitSlop={8}>
              <X size={22} color={colors.grey[60]} />
            </Pressable>
          </View>

          {/* Product name */}
          <ThemedText
            variant="bodySmall"
            color={colors.grey[50]}
            style={styles.modalProduct}
            numberOfLines={1}
          >
            {item.title}
          </ThemedText>

          {submitted ? (
            <View style={styles.successBox}>
              <ShieldCheck size={40} color={colors.success} />
              <ThemedText variant="bodyMedium" color={colors.grey[90]}>
                Review submitted!
              </ThemedText>
              <ThemedText variant="bodySmall" color={colors.grey[50]}>
                It will appear after admin approval.
              </ThemedText>
            </View>
          ) : (
            <ScrollView
              contentContainerStyle={styles.modalForm}
              keyboardShouldPersistTaps="handled"
            >
              {/* Star picker */}
              <View style={styles.starRow}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <Pressable key={i} onPress={() => setRating(i)} hitSlop={6}>
                    <Star
                      size={34}
                      color={colors.warning}
                      fill={i <= rating ? colors.warning : "transparent"}
                    />
                  </Pressable>
                ))}
              </View>

              <Input label="Title" value={title} onChangeText={setTitle} />
              <Input
                label="Your review"
                value={content}
                onChangeText={setContent}
                multiline
                numberOfLines={4}
                style={styles.textArea}
              />

              {error ? (
                <ThemedText variant="bodySmall" color={colors.error}>
                  {error}
                </ThemedText>
              ) : null}

              <Button
                title="Submit review"
                fullWidth
                loading={submitting}
                onPress={submit}
              />
            </ScrollView>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const customer = useAuthStore((s) => s.customer)
  const [order, setOrder] = useState<HttpTypes.StoreOrder | null>(null)
  const [loading, setLoading] = useState(true)

  // Review state
  const [activeReview, setActiveReview] = useState<ReviewItem | null>(null)
  const [reviewedProductIds, setReviewedProductIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!id) return
    setLoading(true)
    Promise.all([
      retrieveOrder(id),
      getReviewedProductIds().catch(() => [])
    ])
      .then(([orderRes, reviewedIds]) => {
        setOrder(orderRes)
        setReviewedProductIds(new Set(reviewedIds))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  const currency = order?.currency_code || "bdt"
  const provider =
    order?.payment_collections?.[0]?.payments?.[0]?.provider_id ?? ""

  const customStatus = (order?.metadata as any)?.custom_status || order?.status || "pending"
  const steps = getStepsForStatus(customStatus)
  const activeIndex = getActiveStepIndex(customStatus, steps)
  const stepColors = getStepColors(customStatus)

  const isEligibleForReview = customStatus === "delivered" || customStatus === "refunded"

  const customerName = customer?.first_name
    ? `${customer.first_name} ${customer.last_name ?? ""}`.trim()
    : customer?.email?.split("@")[0] ?? "Customer"
  const customerEmail = customer?.email ?? ""

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
                      {(item as any).product_title || item.title}
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

          {/* ── Rate Your Items (delivered / refunded only) ── */}
          {isEligibleForReview && (order.items?.length ?? 0) > 0 && (
            <View style={styles.reviewCard}>
              <View style={styles.reviewCardHeader}>
                <Star size={16} color={colors.warning} fill={colors.warning} />
                <ThemedText variant="subheading" color={colors.grey[90]}>
                  Rate Your Items
                </ThemedText>
              </View>
              <ThemedText variant="bodySmall" color={colors.grey[50]} style={styles.reviewCardSubtitle}>
                Share your experience with the products you received.
              </ThemedText>

              {order.items?.map((item) => {
                const productId =
                  (item as any).product_id ||
                  item.product?.id ||
                  item.variant?.product_id
                const alreadyReviewed = productId && reviewedProductIds.has(productId)

                return (
                  <View key={item.id} style={styles.reviewItemRow}>
                    {item.thumbnail ? (
                      <Image source={item.thumbnail} style={styles.reviewThumb} contentFit="cover" />
                    ) : null}
                    <View style={styles.flex}>
                      <ThemedText variant="body" color={colors.grey[90]} numberOfLines={2}>
                        {(item as any).product_title || item.title}
                      </ThemedText>
                      {(item as any).variant_title ? (
                        <ThemedText variant="bodySmall" color={colors.grey[50]}>
                          {(item as any).variant_title}
                        </ThemedText>
                      ) : null}
                    </View>
                    {alreadyReviewed ? (
                      <View style={styles.reviewedBadge}>
                        <ShieldCheck size={12} color={colors.success} />
                        <ThemedText variant="bodySmall" color={colors.success}>
                          Reviewed
                        </ThemedText>
                      </View>
                    ) : productId ? (
                      <Pressable
                        style={styles.writeReviewBtn}
                        onPress={() =>
                          setActiveReview({
                            productId,
                            title: (item as any).product_title || item.title || "",
                            thumbnail: item.thumbnail,
                          })
                        }
                      >
                        <Star size={11} color="#fff" fill="#fff" />
                        <ThemedText variant="bodySmall" color="#fff" style={styles.writeReviewText}>
                          Review
                        </ThemedText>
                      </Pressable>
                    ) : null}
                  </View>
                )
              })}

              <View style={styles.reviewCardFooter}>
                <ShieldCheck size={12} color={colors.grey[40]} />
                <ThemedText variant="bodySmall" color={colors.grey[40]} style={styles.flex}>
                  Reviews appear after admin approval.
                </ThemedText>
              </View>
            </View>
          )}

        </ScrollView>
      )}

      {/* ── Review Modal ── */}
      {activeReview && (
        <ReviewModal
          item={activeReview}
          orderId={order?.id ?? ""}
          customer={{ name: customerName, email: customerEmail }}
          onClose={() => setActiveReview(null)}
          onSubmitted={() => {
            if (activeReview.productId) {
              setReviewedProductIds((prev) => {
                const next = new Set(prev)
                next.add(activeReview.productId)
                return next
              })
            }
            setActiveReview(null)
          }}
        />
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
  trackingTitle: { marginBottom: spacing.xs },
  stepsContainer: { gap: 0 },
  stepRow: { flexDirection: "row", gap: spacing.md },
  stepLeft: { alignItems: "center", width: 32 },
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
  stepContent: { flex: 1, paddingTop: 6, gap: 2 },
  activeLabel: { fontWeight: "700" },
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
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusBadgeText: { fontWeight: "600", fontSize: 12 },

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

  // Rate Your Items card
  reviewCard: {
    backgroundColor: colors.grey[0],
    borderWidth: 1,
    borderColor: colors.grey[20],
    borderRadius: borderRadius.rounded,
    padding: spacing.base,
    gap: spacing.sm,
  },
  reviewCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  reviewCardSubtitle: { marginBottom: spacing.xs },
  reviewItemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.grey[5],
    borderRadius: borderRadius.base,
    padding: spacing.sm,
  },
  reviewThumb: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.base,
    backgroundColor: colors.grey[10],
  },
  reviewedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: "rgba(16,185,129,0.1)",
  },
  writeReviewBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: colors.grey[90],
  },
  writeReviewText: { fontWeight: "700", fontSize: 11 },
  reviewCardFooter: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.xs,
    marginTop: spacing.xs,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.grey[10],
  },

  // Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: colors.grey[0],
    borderTopLeftRadius: borderRadius.large,
    borderTopRightRadius: borderRadius.large,
    paddingTop: spacing.base,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  modalProduct: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  modalForm: {
    padding: spacing.base,
    gap: spacing.base,
    paddingBottom: spacing.xl,
  },
  starRow: {
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "center",
    paddingVertical: spacing.sm,
  },
  textArea: { minHeight: 90, textAlignVertical: "top", paddingTop: spacing.md },
  successBox: {
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.xl,
  },
})
