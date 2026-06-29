import { useCallback, useEffect, useState } from "react"
import { RefreshControl, View, StyleSheet, Platform } from "react-native"
import Animated, { useSharedValue, useAnimatedScrollHandler, runOnJS } from "react-native-reanimated"
import { useRouter } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { HttpTypes } from "@medusajs/types"
import { Screen } from "@components/layout/Screen"
import { Header } from "@components/layout/Header"
import { AnnouncementBar } from "@components/layout/AnnouncementBar"
import { HeroCarousel } from "@components/home/HeroCarousel"
import { SectionHeader } from "@components/home/SectionHeader"
import { CategoryTiles } from "@components/home/CategoryTiles"
import { SuggestedForYouRail } from "@components/home/SuggestedForYouRail"
import { ProductRail } from "@components/product/ProductRail"
import { CustomRefreshIndicator } from "@components/ui/CustomRefreshIndicator"
import { FilterBottomSheet } from "@components/search/FilterBottomSheet"
import { useRegionStore } from "@stores/region-store"
import { useHeroStore } from "@stores/hero-store"
import { listProducts } from "@api/products"
import { listCategories, filterCategoriesWithProducts } from "@api/categories"
import { listCollections } from "@api/collections"
import { getBestSelling } from "@api/enhancements"
import { colors, spacing } from "@design/theme"

interface FeaturedCollection {
  id: string
  title: string
  products: HttpTypes.StoreProduct[]
}

export default function HomeScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const region = useRegionStore((s) => s.region)
  const countryCode = useRegionStore((s) => s.countryCode)
  const isReady = useRegionStore((s) => s.isReady)

  // Hero — SWR cache store (shows instantly from AsyncStorage, revalidates in background)
  const heroSlides = useHeroStore((s) => s.slides)
  const heroInit = useHeroStore((s) => s.init)
  const heroRefresh = useHeroStore((s) => s.refresh)

  const [products, setProducts] = useState<HttpTypes.StoreProduct[]>([])
  const [bestSelling, setBestSelling] = useState<HttpTypes.StoreProduct[]>([])
  const [categories, setCategories] = useState<HttpTypes.StoreProductCategory[]>([])
  const [featured, setFeatured] = useState<FeaturedCollection[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [localRefreshing, setLocalRefreshing] = useState(false)
  const shouldRefresh = useSharedValue(false)

  useEffect(() => {
    setLocalRefreshing(refreshing)
  }, [refreshing])

  const [searchValue, setSearchValue] = useState("")
  const [filterVisible, setFilterVisible] = useState(false)

  const scrollY = useSharedValue(0)
  const isDragging = useSharedValue(false)

  const load = useCallback(async () => {
    try {
      const [prodRes, cats, best, collectionsRes] = await Promise.all([
        listProducts({ countryCode, queryParams: { limit: 10 } }),
        listCategories({ limit: 12 }),
        region?.id ? getBestSelling(region.id, 10) : Promise.resolve([]),
        listCollections({ limit: "3" }),
      ])

      setProducts(prodRes.response.products)
      setCategories(filterCategoriesWithProducts(cats).slice(0, 10))
      setBestSelling(best)

      // Featured collections: first 3 collections, 4 products each
      const featuredData = await Promise.all(
        collectionsRes.collections.slice(0, 3).map(async (c) => {
          const res = await listProducts({
            countryCode,
            queryParams: { collection_id: [c.id], limit: 4 },
          })
          return { id: c.id, title: c.title, products: res.response.products }
        })
      )
      setFeatured(featuredData.filter((f) => f.products.length > 0))
    } catch (e) {
      if (__DEV__) console.warn("[home] load failed", e)
    } finally {
      setLoading(false)
    }
  }, [countryCode, region?.id])

  const startRefresh = useCallback(async () => {
    setRefreshing(true)
    await Promise.all([load(), heroRefresh()])
    setRefreshing(false)
  }, [load, heroRefresh])

  const handleRefreshControlTrigger = useCallback(() => {
    if (isDragging.value) {
      shouldRefresh.value = true
      setLocalRefreshing(true)
    } else {
      startRefresh()
    }
  }, [startRefresh])

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y
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

  useEffect(() => {
    if (isReady) {
      load()
      heroInit()
    }
  }, [isReady, load, heroInit])


  const handleSearchSubmit = (term: string) => {
    if (term.trim()) {
      router.push({
        pathname: "/(tabs)/shop",
        params: { q: term.trim() },
      })
    }
  }

  const handleApplyFilter = (sortBy: string, category: string | null) => {
    setFilterVisible(false)
    const params: any = { sortBy }
    if (category) params.category = category
    router.push({
      pathname: "/(tabs)/shop",
      params,
    })
  }

  return (
    <Screen edges={["bottom", "left", "right"]} background={colors.grey[0]}>
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingTop: 140 + insets.top }]}
        style={{ backgroundColor: colors.grey[0] }}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={localRefreshing}
            onRefresh={handleRefreshControlTrigger}
            tintColor="transparent"
            colors={["transparent"]}
            style={{ backgroundColor: "transparent" }}
            progressBackgroundColor="transparent"
            progressViewOffset={Platform.OS === 'android' ? 30 : 140 + insets.top}
          />
        }
      >
        <CustomRefreshIndicator scrollY={scrollY} isRefreshing={localRefreshing} initialOffset={-(140 + insets.top)} isDragging={isDragging} />
        <AnnouncementBar scrollY={scrollY} />

        <HeroCarousel slides={heroSlides} />

        {categories.length > 0 || loading ? (
          <View>
            <SectionHeader title="Shop by Category" />
            <CategoryTiles categories={categories} />
          </View>
        ) : null}

        <View>
          <SectionHeader
            title="New Arrivals"
            onSeeAll={() => router.push("/(tabs)/shop")}
          />
          <ProductRail products={products} loading={loading} />
        </View>

        {bestSelling.length > 0 ? (
          <View>
            <SectionHeader
              title="Best Selling"
              onSeeAll={() =>
                router.push({
                  pathname: "/(tabs)/shop",
                  params: { sortBy: "best_selling" },
                })
              }
            />
            <ProductRail products={bestSelling} />
          </View>
        ) : null}

        {/* Suggested For You — personalised or trending based on behaviour */}
        <SuggestedForYouRail limit={10} />

        {featured.map((collection) => (
          <View key={collection.id}>
            <SectionHeader title={collection.title} />
            <ProductRail products={collection.products} />
          </View>
        ))}
        </Animated.ScrollView>

      <Header
        scrollY={scrollY}
        searchValue={searchValue}
        onChangeSearch={setSearchValue}
        onSubmitSearch={handleSearchSubmit}
        onPressFilter={() => setFilterVisible(true)}
      />

      <FilterBottomSheet
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        categories={categories}
        initialSortBy="created_at"
        initialCategory={null}
        onApply={handleApplyFilter}
      />
    </Screen>
  )
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: spacing["3xl"],
  },
})
