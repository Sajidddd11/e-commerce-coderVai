import { useMemo, useCallback } from "react"
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  useWindowDimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native"
import { HttpTypes } from "@medusajs/types"
import { ProductCard } from "./ProductCard"
import { Skeleton } from "../ui/Skeleton"
import { splitIntoMasonryColumns } from "@utils/masonry-columns"
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

const H_PAD = spacing.sm
const GAP = spacing.sm

export function ProductGrid({
  products,
  loading = false,
  refreshing = false,
  onRefresh,
  onEndReached,
  ListHeaderComponent,
  ListEmptyComponent,
}: ProductGridProps) {
  const { width: screenWidth } = useWindowDimensions()
  const columnWidth = (screenWidth - H_PAD * 2 - GAP) / 2

  const valid = products.filter((p) => !!p?.id)

  const [leftColumn, rightColumn] = useMemo(
    () => splitIntoMasonryColumns(valid, columnWidth, GAP),
    [valid, columnWidth]
  )

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (!onEndReached) return
      const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent
      const nearBottom =
        layoutMeasurement.height + contentOffset.y >= contentSize.height - 240
      if (nearBottom) onEndReached()
    },
    [onEndReached]
  )

  if (loading && valid.length === 0) {
    return (
      <View style={styles.skeletonWrap}>
        <View style={styles.masonryRow}>
          <View style={[styles.column, { width: columnWidth }]}>
            <Skeleton height={columnWidth * 1.2} radius={8} />
            <Skeleton width="90%" height={14} />
            <Skeleton width="55%" height={14} />
          </View>
          <View style={[styles.column, { width: columnWidth }]}>
            <Skeleton height={columnWidth * 0.9} radius={8} />
            <Skeleton width="85%" height={14} />
            <Skeleton width="50%" height={14} />
          </View>
        </View>
      </View>
    )
  }

  if (!loading && valid.length === 0 && ListEmptyComponent) {
    return <>{ListEmptyComponent}</>
  }

  const renderColumn = (
    entries: Array<{ item: HttpTypes.StoreProduct; index: number }>
  ) => (
    <View style={[styles.column, { width: columnWidth }]}>
      {entries.map(({ item, index }) => (
        <ProductCard key={item.id} product={item} masonryIndex={index} />
      ))}
    </View>
  )

  const header =
    ListHeaderComponent == null
      ? null
      : typeof ListHeaderComponent === "function"
        ? <ListHeaderComponent />
        : ListHeaderComponent

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      onScroll={handleScroll}
      scrollEventThrottle={400}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.brand.teal}
          />
        ) : undefined
      }
    >
      {header}
      <View style={styles.masonryRow}>
        {renderColumn(leftColumn)}
        {renderColumn(rightColumn)}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: H_PAD,
    paddingBottom: spacing.lg,
    flexGrow: 1,
  },
  masonryRow: {
    flexDirection: "row",
    gap: GAP,
    alignItems: "flex-start",
  },
  column: {
    gap: GAP,
  },
  skeletonWrap: {
    paddingHorizontal: H_PAD,
    paddingTop: spacing.sm,
  },
})
