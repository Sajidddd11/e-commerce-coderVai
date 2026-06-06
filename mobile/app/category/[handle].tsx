import { useEffect, useState } from "react"
import { View, Pressable, StyleSheet } from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import { ChevronLeft } from "lucide-react-native"
import { HttpTypes } from "@medusajs/types"
import { Screen } from "@components/layout/Screen"
import { ThemedText } from "@components/ui/ThemedText"
import { ProductGrid } from "@components/product/ProductGrid"
import { useRegionStore } from "@stores/region-store"
import { getCategoryByHandle } from "@api/categories"
import { listProducts } from "@api/products"
import { colors, spacing } from "@design/theme"

export default function CategoryScreen() {
  const { handle } = useLocalSearchParams<{ handle: string }>()
  const router = useRouter()
  const countryCode = useRegionStore((s) => s.countryCode)
  const isReady = useRegionStore((s) => s.isReady)

  const [title, setTitle] = useState("Category")
  const [products, setProducts] = useState<HttpTypes.StoreProduct[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isReady || !handle) return
    setLoading(true)
    ;(async () => {
      try {
        const category = await getCategoryByHandle([handle])
        if (category) {
          setTitle(category.name)
          const res = await listProducts({
            countryCode,
            queryParams: { category_id: [category.id], limit: 50 } as any,
          })
          setProducts(res.response.products)
        }
      } finally {
        setLoading(false)
      }
    })()
  }, [handle, isReady, countryCode])

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
                No products in this category yet.
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
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
  },
  back: {
    padding: spacing.xs,
  },
  empty: {
    alignItems: "center",
    paddingVertical: spacing["4xl"],
  },
})
