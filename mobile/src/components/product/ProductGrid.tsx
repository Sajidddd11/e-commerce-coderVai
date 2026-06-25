import { useMemo, useCallback, useState, useEffect } from "react"
import {
  View,
  StyleSheet,
  RefreshControl,
  useWindowDimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  ActivityIndicator,
  Platform,
} from "react-native"
import Animated, { useSharedValue, useAnimatedScrollHandler, runOnJS } from "react-native-reanimated"
import { HttpTypes } from "@medusajs/types"
import { ProductCard } from "./ProductCard"
import { Skeleton } from "../ui/Skeleton"
import { CustomRefreshIndicator } from "../ui/CustomRefreshIndicator"
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
  loadingMore?: boolean
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
  loadingMore = false,
}: ProductGridProps) {
  const { width: screenWidth } = useWindowDimensions()
  const columnWidth = (screenWidth - H_PAD * 2 - GAP) / 2

  const valid = products.filter((p) => !!p?.id)

  const [leftColumn, rightColumn] = useMemo(
    () => splitIntoMasonryColumns(valid, columnWidth, GAP),
    [valid, columnWidth]
  )

  const [localRefreshing, setLocalRefreshing] = useState(false)
  const shouldRefresh = useSharedValue(false)

  useEffect(() => {
    setLocalRefreshing(refreshing || false)
  }, [refreshing])

  const scrollY = useSharedValue(0)
  const isDragging = useSharedValue(false)

  const startRefresh = useCallback(() => {
    if (onRefresh) {
      onRefresh()
    }
  }, [onRefresh])

  const handleRefreshControlTrigger = useCallback(() => {
    if (isDragging.value) {
      shouldRefresh.value = true
      setLocalRefreshing(true)
    } else {
      startRefresh()
    }
  }, [startRefresh])

  const handleScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y
      if (onEndReached) {
        const { layoutMeasurement, contentOffset, contentSize } = event
        const nearBottom =
          layoutMeasurement.height + contentOffset.y >= contentSize.height - 240
        if (nearBottom) {
          runOnJS(onEndReached)()
        }
      }
    },
    onBeginDrag: () => {
      isDragging.value = true
    },
    onEndDrag: () => {
      isDragging.value = false
      if (shouldRefresh.value) {
        shouldRefresh.value = false
        runOnJS(startRefresh)()
      }
    },
    onMomentumEnd: () => {
      isDragging.value = false
      if (shouldRefresh.value) {
        shouldRefresh.value = false
        runOnJS(startRefresh)()
      }
    },
  })

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
    <Animated.ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      onScroll={handleScroll}
      scrollEventThrottle={16}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={localRefreshing}
            onRefresh={handleRefreshControlTrigger}
            tintColor="transparent"
            colors={["transparent"]}
            style={{ backgroundColor: "transparent" }}
            progressBackgroundColor="transparent"
            progressViewOffset={Platform.OS === 'android' ? -100 : 0}
          />
        ) : undefined
      }
    >
      {onRefresh && <CustomRefreshIndicator scrollY={scrollY} isRefreshing={localRefreshing} isDragging={isDragging} />}
      {header}
      <View style={styles.masonryRow}>
        {renderColumn(leftColumn)}
        {renderColumn(rightColumn)}
      </View>
      {loadingMore ? (
        <View style={styles.loadingMore}>
          <ActivityIndicator size="small" color={colors.brand.teal} />
        </View>
      ) : null}
    </Animated.ScrollView>
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
  loadingMore: {
    paddingVertical: spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },
})
