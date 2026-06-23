/**
 * /recommendations — Full-screen "See All" recommendations screen.
 *
 * Navigated to when the user taps "See All" on the SuggestedForYouRail
 * on the home screen. Shows all recommended products in a masonry grid
 * matching the category and shop screens.
 */

import { useEffect, useState } from "react"
import { View, Pressable, StyleSheet } from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import { ChevronLeft } from "lucide-react-native"
import { HttpTypes } from "@medusajs/types"
import { Screen } from "@components/layout/Screen"
import { ThemedText } from "@components/ui/ThemedText"
import { ProductGrid } from "@components/product/ProductGrid"
import { useRegionStore } from "@stores/region-store"
import { getRecommendations, trackEvent } from "@api/recommendations"
import { colors, spacing } from "@design/theme"

export default function RecommendationsScreen() {
  const router      = useRouter()
  const isReady     = useRegionStore((s) => s.isReady)
  const region      = useRegionStore((s) => s.region)

  const {
    title       = "Suggested For You",
    strategy    = "auto",
    customer_id,
    region_id,
  } = useLocalSearchParams<{
    title:        string
    strategy:     string
    customer_id?: string
    region_id?:   string
  }>()

  const [products, setProducts] = useState<HttpTypes.StoreProduct[]>([])
  const [recommId, setRecommId] = useState<string | null>(null)
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    if (!isReady) return
    setLoading(true)
    getRecommendations({
      type:        "auto",
      customer_id: customer_id || undefined,
      region_id:   region_id || region?.id,
      limit:       40,
    })
      .then((res) => {
        setProducts(res.products ?? [])
        setRecommId(res.recomm_id ?? null)
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [isReady, customer_id, region_id, region?.id])

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.back}>
          <ChevronLeft size={24} color={colors.grey[90]} />
        </Pressable>
        <ThemedText variant="sectionHeading" color={colors.grey[90]} numberOfLines={1}>
          {title}
        </ThemedText>
      </View>

      <ProductGrid
        products={products}
        loading={loading}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <ThemedText variant="body" color={colors.grey[50]}>
                No recommendations yet. Browse some products first!
              </ThemedText>
            </View>
          ) : null
        }
      />
    </Screen>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection:    "row",
    alignItems:       "center",
    gap:              spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical:   spacing.md,
  },
  back: {
    padding: spacing.xs,
  },
  empty: {
    alignItems:    "center",
    paddingVertical: spacing["4xl"],
    paddingHorizontal: spacing.md,
    textAlign:     "center",
  },
})
