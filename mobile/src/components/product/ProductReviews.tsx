import { useEffect, useState } from "react"
import { View, StyleSheet } from "react-native"
import { Star, ShieldCheck } from "lucide-react-native"
import { ThemedText } from "../ui/ThemedText"
import {
  getProductReviews,
  ProductReview,
} from "@api/enhancements"
import { colors, spacing, borderRadius } from "@design/theme"

function Stars({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <View style={styles.starsRow}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          color={colors.warning}
          fill={i <= Math.round(value) ? colors.warning : "transparent"}
        />
      ))}
    </View>
  )
}

export function ProductReviews({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<ProductReview[]>([])
  const [average, setAverage] = useState(0)
  const [count, setCount] = useState(0)
  const [loaded, setLoaded] = useState(false)

  const load = () => {
    getProductReviews(productId).then((res) => {
      setReviews(res.reviews)
      setAverage(res.average)
      setCount(res.count)
      setLoaded(true)
    })
  }

  useEffect(() => {
    if (productId) load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId])

  // Don't render until we know whether reviews exist (graceful fallback)
  if (!loaded) return null

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <View>
          <ThemedText variant="subheading" color={colors.grey[80]}>
            Reviews
          </ThemedText>
          {count > 0 ? (
            <View style={styles.summary}>
              <Stars value={average} />
              <ThemedText variant="bodySmall" color={colors.grey[50]}>
                {average.toFixed(1)} · {count} review{count === 1 ? "" : "s"}
              </ThemedText>
            </View>
          ) : (
            <ThemedText variant="bodySmall" color={colors.grey[50]}>
              No reviews yet
            </ThemedText>
          )}
        </View>
      </View>

      {/* Info note — reviews come from order history */}
      <View style={styles.infoBox}>
        <ShieldCheck size={14} color={colors.grey[50]} />
        <ThemedText variant="bodySmall" color={colors.grey[50]} style={styles.infoText}>
          Purchased this product? Review it from{" "}
          <ThemedText variant="bodySmall" color={colors.brand.teal}>
            My Orders
          </ThemedText>{" "}
          after delivery.
        </ThemedText>
      </View>

      {reviews.slice(0, 5).map((r) => (
        <View key={r.id} style={styles.review}>
          <View style={styles.reviewHeader}>
            <ThemedText variant="bodyMedium" color={colors.grey[90]}>
              {r.customer_name || "Customer"}
            </ThemedText>
            <Stars value={r.rating} />
          </View>
          {r.title ? (
            <ThemedText variant="bodyMedium" color={colors.grey[80]}>
              {r.title}
            </ThemedText>
          ) : null}
          {r.content ? (
            <ThemedText variant="body" color={colors.grey[60]}>
              {r.content}
            </ThemedText>
          ) : null}
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.md, marginTop: spacing.lg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  summary: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginTop: 2 },
  starsRow: { flexDirection: "row", gap: 2 },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.xs,
    backgroundColor: colors.grey[5],
    borderRadius: borderRadius.base,
    padding: spacing.sm,
  },
  infoText: {
    flex: 1,
    lineHeight: 18,
  },
  review: {
    gap: spacing.xs,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.grey[10],
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
})
