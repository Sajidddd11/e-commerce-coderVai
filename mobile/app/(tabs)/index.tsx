import { useCallback, useEffect, useState } from "react"
import { RefreshControl, View, StyleSheet } from "react-native"
import Animated, { useSharedValue, useAnimatedScrollHandler } from "react-native-reanimated"
import { useRouter } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { HttpTypes } from "@medusajs/types"
import { Screen } from "@components/layout/Screen"
import { Header } from "@components/layout/Header"
import { AnnouncementBar } from "@components/layout/AnnouncementBar"
import { HeroBanner } from "@components/home/HeroBanner"
import { HeroCarousel } from "@components/home/HeroCarousel"
import { SectionHeader } from "@components/home/SectionHeader"
import { CategoryTiles } from "@components/home/CategoryTiles"
import { SuggestedForYouRail } from "@components/home/SuggestedForYouRail"
import { ProductRail } from "@components/product/ProductRail"
import { FilterBottomSheet } from "@components/search/FilterBottomSheet"
import { useRegionStore } from "@stores/region-store"
import { listProducts } from "@api/products"
import { listCategories, filterCategoriesWithProducts } from "@api/categories"
import { listCollections } from "@api/collections"
import { getHeroSlides, getBestSelling, HeroSlide } from "@api/enhancements"
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

  const [slides, setSlides] = useState<HeroSlide[]>([])
  const [products, setProducts] = useState<HttpTypes.StoreProduct[]>([])
  const [bestSelling, setBestSelling] = useState<HttpTypes.StoreProduct[]>([])
  const [categories, setCategories] = useState<HttpTypes.StoreProductCategory[]>([])
  const [featured, setFeatured] = useState<FeaturedCollection[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const [searchValue, setSearchValue] = useState("")
  const [filterVisible, setFilterVisible] = useState(false)

  const scrollY = useSharedValue(0)

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y
    },
  })

  const load = useCallback(async () => {
    try {
      const [prodRes, cats, slideRes, best, collectionsRes] = await Promise.all([
        listProducts({ countryCode, queryParams: { limit: 10 } }),
        listCategories({ limit: 12 }),
        getHeroSlides(),
        region?.id ? getBestSelling(region.id, 10) : Promise.resolve([]),
        listCollections({ limit: "3" }),
      ])

      setProducts(prodRes.response.products)
      setCategories(filterCategoriesWithProducts(cats).slice(0, 10))
      setSlides(slideRes ?? [])
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

  useEffect(() => {
    if (isReady) load()
  }, [isReady, load])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await load()
    setRefreshing(false)
  }, [load])

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

  const localSlides: HeroSlide[] = [
    {
      image: require("../../Hero/1.jpeg"),
      title: "New Season\nArrivals",
      subtitle: "2026 COLLECTION",
      link: "/(tabs)/shop" as any,
    },
    {
      image: require("../../Hero/2.jpeg"),
      title: "Summer\nEssentials",
      subtitle: "TRENDING NOW",
      link: "/(tabs)/shop" as any,
    },
    {
      image: require("../../Hero/3.jpeg"),
      title: "Everyday\nComfort",
      subtitle: "MUST HAVES",
      link: "/(tabs)/shop" as any,
    }
  ]

  const carouselSlides = slides.length > 0 ? slides : localSlides

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
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.brand.teal}
            progressViewOffset={140 + insets.top}
          />
        }
      >
        <AnnouncementBar scrollY={scrollY} />

        <HeroCarousel slides={carouselSlides} />

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
