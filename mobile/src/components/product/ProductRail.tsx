import { ScrollView, View, StyleSheet } from "react-native"
import { HttpTypes } from "@medusajs/types"
import { ProductCard } from "./ProductCard"
import { Skeleton } from "../ui/Skeleton"
import { spacing } from "@design/theme"

interface ProductRailProps {
  products: HttpTypes.StoreProduct[]
  loading?: boolean
  cardWidth?: number
  /** Called when a product card is pressed — use for recommendation click tracking */
  onProductPress?: (product: HttpTypes.StoreProduct) => void
}

export function ProductRail({
  products,
  loading = false,
  cardWidth = 160,
  onProductPress,
}: ProductRailProps) {
  if (loading && products.length === 0) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {Array.from({ length: 4 }).map((_, i) => (
          <View key={i} style={{ width: cardWidth, gap: spacing.sm }}>
            <Skeleton height={cardWidth} radius={8} />
            <Skeleton width="80%" height={14} />
            <Skeleton width="50%" height={14} />
          </View>
        ))}
      </ScrollView>
    )
  }

  const valid = products.filter((p) => !!p?.id)

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {valid.map((product) => (
        <View key={product.id} style={{ width: cardWidth }}>
          <ProductCard
            product={product}
            width={cardWidth}
            squareImage
            variant="home"
            onPress={onProductPress ? () => onProductPress(product) : undefined}
          />
        </View>
      ))}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.sm,
  },
})

