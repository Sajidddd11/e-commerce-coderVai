import { useCallback, useEffect, useRef, useState } from "react"
import { View, Pressable, TextInput, StyleSheet, ScrollView } from "react-native"
import { useRouter } from "expo-router"
import { Search, X } from "lucide-react-native"
import { Image } from "expo-image"
import { HttpTypes } from "@medusajs/types"
import { Screen } from "@components/layout/Screen"
import { CategoryChips } from "@components/layout/CategoryChips"
import { ProductGrid } from "@components/product/ProductGrid"
import { ThemedText } from "@components/ui/ThemedText"
import { useRegionStore } from "@stores/region-store"
import { listProductsWithSort } from "@api/products"
import { listCategories, filterCategoriesWithProducts } from "@api/categories"
import { getSearchSuggestions, SearchSuggestion } from "@api/enhancements"
import { SortOptions } from "@utils/sort-products"
import { colors, spacing, borderRadius, shadows } from "@design/theme"
import { fontFamily, fontSize } from "@design/typography"

const SORT_OPTIONS: { key: SortOptions; label: string }[] = [
  { key: "created_at", label: "Latest" },
  { key: "price_asc", label: "Price ↑" },
  { key: "price_desc", label: "Price ↓" },
]

const PAGE_SIZE = 12

export default function ShopScreen() {
  const router = useRouter()
  const countryCode = useRegionStore((s) => s.countryCode)
  const isReady = useRegionStore((s) => s.isReady)

  const [products, setProducts] = useState<HttpTypes.StoreProduct[]>([])
  const [categories, setCategories] = useState<
    HttpTypes.StoreProductCategory[]
  >([])
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<SortOptions>("created_at")
  const [searchInput, setSearchInput] = useState("")
  const [query, setQuery] = useState("")
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const suggestTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Debounced search suggestions
  useEffect(() => {
    if (suggestTimer.current) clearTimeout(suggestTimer.current)
    const term = searchInput.trim()
    if (term.length < 2) {
      setSuggestions([])
      return
    }
    suggestTimer.current = setTimeout(() => {
      getSearchSuggestions(term).then(setSuggestions)
    }, 300)
    return () => {
      if (suggestTimer.current) clearTimeout(suggestTimer.current)
    }
  }, [searchInput])

  const runSearch = (term: string) => {
    setQuery(term.trim())
    setShowSuggestions(false)
  }

  // Load categories once
  useEffect(() => {
    if (!isReady) return
    listCategories({ limit: 20 })
      .then((cats) => setCategories(filterCategoriesWithProducts(cats)))
      .catch(() => {})
  }, [isReady])

  const fetchPage = useCallback(
    async (pageToLoad: number, replace: boolean) => {
      const queryParams: any = { limit: PAGE_SIZE }
      if (query) queryParams.q = query
      if (activeCategory) queryParams.category_id = [activeCategory]

      const { response, nextPage } = await listProductsWithSort({
        page: pageToLoad,
        countryCode,
        sortBy,
        queryParams,
      })

      setHasMore(!!nextPage)
      setProducts((prev) =>
        replace ? response.products : [...prev, ...response.products]
      )
    },
    [countryCode, sortBy, query, activeCategory]
  )

  // Reload when filters change
  useEffect(() => {
    if (!isReady) return
    setLoading(true)
    setPage(1)
    fetchPage(1, true).finally(() => setLoading(false))
  }, [isReady, fetchPage])

  const onEndReached = useCallback(() => {
    if (loadingMore || !hasMore || loading) return
    const next = page + 1
    setLoadingMore(true)
    setPage(next)
    fetchPage(next, false).finally(() => setLoadingMore(false))
  }, [loadingMore, hasMore, loading, page, fetchPage])

  return (
    <Screen>
      <View style={styles.searchRow}>
        <View style={styles.searchPill}>
          <Search size={18} color={colors.grey[50]} />
          <TextInput
            value={searchInput}
            onChangeText={(v) => {
              setSearchInput(v)
              setShowSuggestions(true)
            }}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Search products"
            placeholderTextColor={colors.grey[40]}
            returnKeyType="search"
            onSubmitEditing={() => runSearch(searchInput)}
            style={styles.searchInput}
          />
          {searchInput.length > 0 ? (
            <Pressable
              hitSlop={8}
              onPress={() => {
                setSearchInput("")
                setQuery("")
                setSuggestions([])
              }}
            >
              <X size={18} color={colors.grey[50]} />
            </Pressable>
          ) : null}
        </View>

        {showSuggestions && suggestions.length > 0 ? (
          <View style={styles.suggestBox}>
            <ScrollView keyboardShouldPersistTaps="handled">
              {suggestions.map((s, i) => (
                <Pressable
                  key={s.id ?? `${s.title}-${i}`}
                  style={styles.suggestRow}
                  onPress={() => {
                    if (s.handle) {
                      setShowSuggestions(false)
                      router.push(`/product/${s.handle}`)
                    } else {
                      setSearchInput(s.title)
                      runSearch(s.title)
                    }
                  }}
                >
                  {s.thumbnail ? (
                    <Image
                      source={s.thumbnail}
                      style={styles.suggestThumb}
                      contentFit="cover"
                    />
                  ) : (
                    <Search size={16} color={colors.grey[40]} />
                  )}
                  <ThemedText
                    variant="body"
                    color={colors.grey[80]}
                    numberOfLines={1}
                    style={styles.flex}
                  >
                    {s.title}
                  </ThemedText>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        ) : null}
      </View>

      <CategoryChips
        categories={categories}
        activeId={activeCategory}
        onSelect={setActiveCategory}
      />

      <View style={styles.sortRow}>
        {SORT_OPTIONS.map((opt) => {
          const active = sortBy === opt.key
          return (
            <Pressable
              key={opt.key}
              onPress={() => setSortBy(opt.key)}
              style={[
                styles.sortChip,
                {
                  borderColor: active ? colors.brand.teal : colors.grey[20],
                  backgroundColor: active ? colors.brand.tealMuted : colors.grey[0],
                },
              ]}
            >
              <ThemedText
                variant="bodySmall"
                color={active ? colors.brand.teal : colors.grey[60]}
              >
                {opt.label}
              </ThemedText>
            </Pressable>
          )
        })}
      </View>

      <View style={styles.grid}>
        <ProductGrid
          products={products}
          loading={loading}
          onEndReached={onEndReached}
          ListEmptyComponent={
            !loading ? (
              <View style={styles.empty}>
                <ThemedText variant="body" color={colors.grey[50]}>
                  No products found.
                </ThemedText>
              </View>
            ) : null
          }
        />
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  searchRow: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.sm,
    zIndex: 20,
  },
  searchPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.grey[10],
    borderRadius: borderRadius.rounded,
    paddingHorizontal: spacing.base,
  },
  suggestBox: {
    position: "absolute",
    top: 52,
    left: spacing.base,
    right: spacing.base,
    maxHeight: 280,
    backgroundColor: colors.grey[0],
    borderRadius: borderRadius.rounded,
    borderWidth: 1,
    borderColor: colors.grey[20],
    ...shadows.lg,
    zIndex: 30,
  },
  suggestRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.grey[10],
  },
  suggestThumb: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.base,
    backgroundColor: colors.grey[10],
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.md,
    fontFamily: fontFamily.body,
    fontSize: fontSize.md,
    color: colors.grey[90],
  },
  sortRow: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.sm,
  },
  sortChip: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.circle,
    borderWidth: 1,
  },
  grid: {
    flex: 1,
  },
  empty: {
    alignItems: "center",
    paddingVertical: spacing["4xl"],
  },
})
