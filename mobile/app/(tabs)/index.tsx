import { useCallback, useEffect, useState } from "react"
import { ScrollView, RefreshControl, View, StyleSheet } from "react-native"
import { useRouter } from "expo-router"
import { HttpTypes } from "@medusajs/types"
import { Screen } from "@components/layout/Screen"
import { Header } from "@components/layout/Header"
import { Footer } from "@components/layout/Footer"
import { AnnouncementBar } from "@components/layout/AnnouncementBar"
import { WhatsAppFAB } from "@components/layout/WhatsAppFAB"
import { HeroBanner } from "@components/home/HeroBanner"
import { HeroCarousel } from "@components/home/HeroCarousel"
import { SectionHeader } from "@components/home/SectionHeader"
import { CategoryTiles } from "@components/home/CategoryTiles"
import { TrustSection } from "@components/home/TrustSection"
import { CTASection } from "@components/home/CTASection"
import { ProductRail } from "@components/product/ProductRail"
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

  const hasCarousel = slides.some((s) => /^https?:\/\//.test(s.image))

  return (
    <Screen>
      <Header />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.brand.teal}
          />
        }
      >
        <AnnouncementBar />

        {hasCarousel ? <HeroCarousel slides={slides} /> : <HeroBanner />}

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
            <SectionHeader title="Best Selling" />
            <ProductRail products={bestSelling} />
          </View>
        ) : null}

        {featured.map((collection) => (
          <View key={collection.id}>
            <SectionHeader title={collection.title} />
            <ProductRail products={collection.products} />
          </View>
        ))}

        <View style={styles.trust}>
          <SectionHeader title="Why shop with us" />
          <TrustSection />
        </View>

        <View style={styles.cta}>
          <CTASection />
        </View>

        <Footer />
      </ScrollView>
      <WhatsAppFAB bottomOffset={90} />
    </Screen>
  )
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: spacing.lg,
  },
  trust: {
    marginTop: spacing.sm,
  },
  cta: {
    marginTop: spacing.lg,
  },
})
