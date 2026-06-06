import { View, StyleSheet, RefreshControl } from "react-native"
import { FlashList } from "@shopify/flash-list"
import { HttpTypes } from "@medusajs/types"
import { ProductCard } from "./ProductCard"
import { Skeleton } from "../ui/Skeleton"
import { colors, spacing } from "@design/theme"

interface ProductGridProps {
  products: HttpTypes.StoreProduct[]
  loading?: boolean
  refreshing?: boolean
  onRefresh?: () => void
  onEndReached?: () => void
  ListHeaderComponent?: React.ComponentType<any> | React.ReactElement | null
  ListEmptyComponent?: React.ComponentType<any> | React.ReactElement | null
}

export function ProductGrid({
  products,
  loading = false,
  refreshing = false,
  onRefresh,
  onEndReached,
  ListHeaderComponent,
  ListEmptyComponent,
}: ProductGridProps) {
  if (loading && products.length === 0) {
    return (
      <View style={styles.skeletonGrid}>
        {Array.from({ length: 6 }).map((_, i) => (
          <View key={i} style={styles.skeletonCell}>
            <Skeleton height={160} radius={8} />
            <Skeleton width="80%" height={14} />
            <Skeleton width="50%" height={14} />
          </View>
        ))}
      </View>
    )
  }

  const valid = products.filter((p) => !!p?.id)

  return (
    <FlashList
      data={valid}
      numColumns={2}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.content}
      renderItem={({ item, index }) => (
        <View
          style={[
            styles.cell,
            { paddingLeft: index % 2 === 0 ? 0 : spacing.sm },
          ]}
        >
          <ProductCard product={item} />
        </View>
      )}
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={ListEmptyComponent}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.brand.teal}
          />
        ) : undefined
      }
    />
  )
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.base,
  },
  cell: {
    flex: 1,
    paddingBottom: spacing.base,
  },
  skeletonGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: spacing.base,
    gap: spacing.base,
  },
  skeletonCell: {
    width: "47%",
    gap: spacing.sm,
  },
})
