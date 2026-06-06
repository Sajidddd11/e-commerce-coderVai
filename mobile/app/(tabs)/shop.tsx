import { useCallback, useEffect, useState } from "react"
import { View, Pressable, StyleSheet, Text } from "react-native"
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
import { colors } from "@design/theme"
import { fontFamily, fontSize } from "@design/typography"

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
    <Screen style={{ backgroundColor: "white" }}>
      <View style={styles.headerArea}>
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
                    active ? styles.sortChipActive : styles.sortChipInactive
                  ]}
                >
                  <Text
                    style={[
                      styles.sortText,
                      active ? styles.sortTextActive : styles.sortTextInactive
                    ]}
                  >
                    {opt.label}
                  </Text>
                </Pressable>
              )
            })}
          </View>
        </View>
        <View style={styles.divider} />
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
  headerArea: {
    backgroundColor: "white",
    zIndex: 20,
  },
  searchRow: {
    paddingHorizontal: 16, // px-4
    paddingTop: 16, // pt-4
    paddingBottom: 12, // pb-3
  },
  suggestWrap: {
    marginTop: 8,
  },
  resultsHeader: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  filters: {
    paddingBottom: 12, // pb-3 (sort row container pb)
  },
  sortRow: {
    flexDirection: "row",
    gap: 8, // gap-2
    paddingHorizontal: 16, // px-4
  },
  sortChip: {
    paddingHorizontal: 16, // px-4
    height: 32, // h-8
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 9999, // rounded-full
    borderStyle: "solid",
  },
  sortChipActive: {
    backgroundColor: "rgba(86, 174, 191, 0.1)", // bg-[#56aebf]/10
    borderColor: "#56AEBF", // border-[#56AEBF]
    borderWidth: 2,
  },
  sortChipInactive: {
    backgroundColor: "white",
    borderColor: "#E5E7EB", // border-gray-200
    borderWidth: 1,
  },
  sortText: {
    fontFamily: fontFamily.interMedium,
    fontSize: fontSize.xs, // text-xs
    lineHeight: 16, // leading-4
  },
  sortTextActive: {
    fontFamily: fontFamily.interSemiBold,
    color: "#56AEBF", // text-[#56AEBF]
  },
  sortTextInactive: {
    color: "#6B7280", // text-gray-500
  },
  divider: {
    height: 1, // h-px
    backgroundColor: "#E5E7EB", // bg-gray-200
  },
  grid: {
    flex: 1,
    backgroundColor: "white", // overflow-y-auto bg-white flex-1
  },
  empty: {
    alignItems: "center",
    paddingVertical: 64, // py-16
  },
})
