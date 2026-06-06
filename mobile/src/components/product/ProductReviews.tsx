import { useEffect, useState } from "react"
import { View, Pressable, StyleSheet, Modal, ScrollView } from "react-native"
import { Star, X } from "lucide-react-native"
import { ThemedText } from "../ui/ThemedText"
import { Button } from "../ui/Button"
import { Input } from "../ui/Input"
import {
  getProductReviews,
  createProductReview,
  ProductReview,
} from "@api/enhancements"
import { useAuthStore } from "@stores/auth-store"
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
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const customer = useAuthStore((s) => s.customer)
  const [reviews, setReviews] = useState<ProductReview[]>([])
  const [average, setAverage] = useState(0)
  const [count, setCount] = useState(0)
  const [loaded, setLoaded] = useState(false)

  const [modalOpen, setModalOpen] = useState(false)
  const [rating, setRating] = useState(5)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  const submit = async () => {
    setError(null)
    setSubmitting(true)
    
    let customer_name = undefined;
    if (customer?.first_name || customer?.last_name) {
      customer_name = `${customer.first_name ?? ""} ${customer.last_name ?? ""}`.trim()
    } else if (customer?.email) {
      customer_name = customer.email.split("@")[0]
    }
    
    const res = await createProductReview(productId, { 
      rating, 
      title, 
      content,
      customer_name,
      customer_email: customer?.email
    })
    setSubmitting(false)
    if (res.success) {
      setModalOpen(false)
      setTitle("")
      setContent("")
      setRating(5)
      load()
    } else {
      setError(res.error ?? "Could not submit review.")
    }
  }

  // Don't render anything until we know whether reviews exist (graceful when
  // the backend route is unavailable).
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
        {isAuthenticated ? (
          <Button
            title="Write"
            variant="secondary"
            size="small"
            onPress={() => setModalOpen(true)}
          />
        ) : null}
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

      <Modal
        visible={modalOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setModalOpen(false)}
      >
        <View style={styles.backdrop}>
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <ThemedText variant="subheading" color={colors.grey[90]}>
                Write a review
              </ThemedText>
              <Pressable onPress={() => setModalOpen(false)} hitSlop={8}>
                <X size={22} color={colors.grey[60]} />
              </Pressable>
            </View>
            <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
              <View style={styles.ratingPicker}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <Pressable key={i} onPress={() => setRating(i)} hitSlop={6}>
                    <Star
                      size={32}
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
              <Button title="Submit review" fullWidth loading={submitting} onPress={submit} />
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  sheet: {
    backgroundColor: colors.grey[0],
    borderTopLeftRadius: borderRadius.large,
    borderTopRightRadius: borderRadius.large,
    paddingTop: spacing.base,
    maxHeight: "85%",
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.md,
  },
  form: { padding: spacing.base, gap: spacing.base },
  ratingPicker: { flexDirection: "row", gap: spacing.sm, justifyContent: "center" },
  textArea: { minHeight: 90, textAlignVertical: "top", paddingTop: spacing.md },
})
