import { useCallback, useEffect, useState } from "react"
import { View, Pressable, StyleSheet } from "react-native"
import { useRouter, useLocalSearchParams } from "expo-router"
import { HttpTypes } from "@medusajs/types"
import { Screen } from "@components/layout/Screen"
import { CategoryChips } from "@components/layout/CategoryChips"
import { ProductGrid } from "@components/product/ProductGrid"
import { ProductSearchBar } from "@components/search/ProductSearchBar"
import { SearchSuggestionsPanel } from "@components/search/SearchSuggestionsPanel"
import { ThemedText } from "@components/ui/ThemedText"
import { useSearchSuggestions } from "@hooks/useSearchSuggestions"
import { useRegionStore } from "@stores/region-store"
import { listProductsWithSort } from "@api/products"
import { listCategories, filterCategoriesWithProducts } from "@api/categories"
import { SortOptions } from "@utils/sort-products"
import { colors, spacing, borderRadius } from "@design/theme"

const SORT_OPTIONS: { key: SortOptions; label: string }[] = [
  { key: "created_at", label: "Latest" },
  { key: "price_asc", label: "Price ↑" },
  { key: "price_desc", label: "Price ↓" },
]

const PAGE_SIZE = 12

export default function ShopScreen() {
  const router = useRouter()
  const { q: qParam } = useLocalSearchParams<{ q?: string }>()
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
  const [showSuggestions, setShowSuggestions] = useState(false)

  const { suggestions, loading: suggestionsLoading } =
    useSearchSuggestions(searchInput)

  useEffect(() => {
    if (typeof qParam === "string" && qParam.trim()) {
      const term = qParam.trim()
      setSearchInput(term)
      setQuery(term)
      setShowSuggestions(false)
    }
  }, [qParam])

  const runSearch = (term: string) => {
    const trimmed = term.trim()
    setSearchInput(trimmed)
    setQuery(trimmed)
    setShowSuggestions(false)
  }

  const clearSearch = () => {
    setSearchInput("")
    setQuery("")
    setShowSuggestions(false)
  }

  useEffect(() => {
    if (!isReady) return
    listCategories({ limit: 20 })
      .then((cats) => setCategories(filterCategoriesWithProducts(cats)))
      .catch(() => {})
  }, [isReady])

  const fetchPage = useCallback(
    async (pageToLoad: number, replace: boolean) => {
      const queryParams: Record<string, unknown> = { limit: PAGE_SIZE }
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
        <ProductSearchBar
          value={searchInput}
          onChangeText={(v) => {
            setSearchInput(v)
            setShowSuggestions(true)
          }}
          onSubmit={runSearch}
          onFocus={() => setShowSuggestions(true)}
          onClear={clearSearch}
        />

        {showSuggestions && searchInput.trim().length >= 2 ? (
          <View style={styles.suggestWrap}>
            <SearchSuggestionsPanel
              query={searchInput}
              suggestions={suggestions}
              loading={suggestionsLoading}
              variant="dropdown"
              onSelectProduct={(handle) => {
                setShowSuggestions(false)
                router.push(`/product/${handle}`)
              }}
              onSelectCategory={(handle) => {
                setShowSuggestions(false)
                router.push(`/category/${handle}`)
              }}
              onSelectCollection={(title) => runSearch(title)}
              onSelectPopular={runSearch}
              onViewAll={runSearch}
            />
          </View>
        ) : null}
      </View>

      {query ? (
        <View style={styles.resultsHeader}>
          <ThemedText variant="sectionHeading" color={colors.grey[90]}>
            Results for "{query}"
          </ThemedText>
          <ThemedText variant="bodySmall" color={colors.grey[50]}>
            Products matching your search
          </ThemedText>
        </View>
      ) : null}

      <View style={styles.filters}>
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
                    backgroundColor: active
                      ? colors.brand.tealMuted
                      : colors.grey[0],
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
                  {query
                    ? `No products found for "${query}".`
                    : "No products found."}
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
  searchRow: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    zIndex: 20,
  },
  suggestWrap: {
    marginTop: spacing.sm,
  },
  resultsHeader: {
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.sm,
    gap: spacing.xs,
  },
  filters: {
    flexGrow: 0,
    gap: spacing.sm,
  },
  sortRow: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.xs,
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
