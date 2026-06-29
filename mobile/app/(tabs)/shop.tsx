import { useCallback, useEffect, useRef, useState } from "react"
import { View, Pressable, StyleSheet, Text, ScrollView } from "react-native"
import { useRouter, useLocalSearchParams } from "expo-router"
import { HttpTypes } from "@medusajs/types"
import { Screen } from "@components/layout/Screen"
import { CategoryChips } from "@components/layout/CategoryChips"
import { ProductGrid } from "@components/product/ProductGrid"
import { ProductSearchBar } from "@components/search/ProductSearchBar"
import { SearchSuggestionsPanel } from "@components/search/SearchSuggestionsPanel"
import { FilterBottomSheet } from "@components/search/FilterBottomSheet"
import { ThemedText } from "@components/ui/ThemedText"
import { ZahanSpinner } from "@components/ui/ZahanSpinner"
import { useSearchSuggestions } from "@hooks/useSearchSuggestions"
import { useRegionStore } from "@stores/region-store"
import { listProductsWithSort } from "@api/products"
import { listCategories, filterCategoriesWithProducts } from "@api/categories"
import { SortOptions } from "@utils/sort-products"
import { convertToLocale } from "@utils/money"
import { colors, spacing } from "@design/theme"
import { fontFamily, fontSize } from "@design/typography"

const SORT_OPTIONS: { key: SortOptions; label: string }[] = [
  { key: "created_at", label: "Latest" },
  { key: "best_selling", label: "Best Selling" },
  { key: "price_asc", label: "Price ↑" },
  { key: "price_desc", label: "Price ↓" },
]

const PAGE_SIZE = 12

export default function ShopScreen() {
  const router = useRouter()
  const { q: qParam, sortBy: sortParam, category: categoryParam } = useLocalSearchParams<{
    q?: string
    sortBy?: string
    category?: string
  }>()
  const countryCode = useRegionStore((s) => s.countryCode)
  const isReady = useRegionStore((s) => s.isReady)

  const [products, setProducts] = useState<HttpTypes.StoreProduct[]>([])
  const [categories, setCategories] = useState<
    HttpTypes.StoreProductCategory[]
  >([])
  const [activeCategories, setActiveCategories] = useState<string[]>([])
  
  // Initialize state directly from sortParam if present on mount
  const [sortBy, setSortBy] = useState<SortOptions>(() => {
    if (sortParam && ["price_asc", "price_desc", "created_at", "best_selling"].includes(sortParam)) {
      return sortParam as SortOptions
    }
    return "created_at"
  })

  const [priceMin, setPriceMin] = useState<number | null>(null)
  const [priceMax, setPriceMax] = useState<number | null>(null)

  const [searchInput, setSearchInput] = useState("")
  const [query, setQuery] = useState("")
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [filterVisible, setFilterVisible] = useState(false)

  // Track request count to avoid race conditions with multiple concurrent fetches
  const requestCountRef = useRef(0)
  // Track if a page is currently loading to prevent duplicate scroll triggers
  const isLoadingMoreRef = useRef(false)

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

  useEffect(() => {
    if (sortParam && ["price_asc", "price_desc", "created_at", "best_selling"].includes(sortParam)) {
      setSortBy(sortParam as SortOptions)
    }
  }, [sortParam])

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
    router.setParams({ q: undefined })
  }

  useEffect(() => {
    if (!isReady) return
    listCategories({ limit: 20 })
      .then((cats) => setCategories(filterCategoriesWithProducts(cats)))
      .catch(() => {})
  }, [isReady])

  useEffect(() => {
    if (categoryParam && categories.length > 0) {
      const matches = categories
        .filter((c) => c.handle === categoryParam || c.id === categoryParam)
        .map((c) => c.id)
      if (matches.length > 0) {
        setActiveCategories(matches)
      }
    }
  }, [categoryParam, categories])

  const fetchPage = useCallback(
    async (pageToLoad: number, replace: boolean) => {
      const requestId = ++requestCountRef.current
      const queryParams: Record<string, unknown> = { limit: PAGE_SIZE }
      if (query) queryParams.q = query
      if (activeCategories.length > 0) {
        queryParams.category_id = activeCategories
      }

      const { response, nextPage } = await listProductsWithSort({
        page: pageToLoad,
        countryCode,
        sortBy,
        queryParams,
        priceMin: priceMin !== null ? priceMin : undefined,
        priceMax: priceMax !== null ? priceMax : undefined,
      })

      // If a newer request has been started since this one resolved, ignore this response
      if (requestId !== requestCountRef.current) {
        return
      }

      setHasMore(!!nextPage)
      setProducts((prev) =>
        replace ? response.products : [...prev, ...response.products]
      )
    },
    [countryCode, sortBy, query, activeCategories, priceMin, priceMax]
  )

  useEffect(() => {
    if (!isReady) return
    setLoading(true)
    setPage(1)
    fetchPage(1, true).finally(() => setLoading(false))
  }, [isReady, fetchPage])

  const onEndReached = useCallback(() => {
    if (isLoadingMoreRef.current || !hasMore || loading) return
    
    isLoadingMoreRef.current = true
    setLoadingMore(true)
    
    const next = page + 1
    setPage(next)
    
    fetchPage(next, false).finally(() => {
      isLoadingMoreRef.current = false
      setLoadingMore(false)
    })
  }, [hasMore, loading, page, fetchPage])

  const activeCategoryObjects = categories.filter((c) => activeCategories.includes(c.id))
  const hasActiveFilters = activeCategories.length > 0 || priceMin !== null || priceMax !== null || sortBy !== "created_at"

  const clearAllFilters = () => {
    setActiveCategories([])
    setSortBy("created_at")
    setPriceMin(null)
    setPriceMax(null)
    router.setParams({ category: undefined, sortBy: undefined, q: undefined })
  }

  const getProductsPriceRange = () => {
    if (!products || products.length === 0) return null
    let min = Infinity
    let max = -Infinity
    products.forEach((p) => {
      p.variants?.forEach((v) => {
        const amount = v.calculated_price?.calculated_amount
        if (typeof amount === "number") {
          if (amount < min) min = amount
          if (amount > max) max = amount
        }
      })
    })
    if (min === Infinity || max === -Infinity) return null
    return { min, max }
  }

  const priceRange = getProductsPriceRange()

  const getFormattedPriceRange = () => {
    if (!priceRange) return ""
    const currency = products[0]?.variants?.[0]?.calculated_price?.currency_code || "bdt"
    const minFormatted = convertToLocale({ amount: priceRange.min, currency_code: currency })
    const maxFormatted = convertToLocale({ amount: priceRange.max, currency_code: currency })
    return `${minFormatted} - ${maxFormatted}`
  }

  return (
    <Screen background="white">
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
            onPressFilter={() => setFilterVisible(true)}
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
                  const match = categories.find((c) => c.handle === handle)
                  if (match) {
                    setActiveCategories([match.id])
                  }
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

        {/* Active Filters Row */}
        {hasActiveFilters ? (
          <View style={styles.activeFiltersRow}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.activeFiltersScroll}>
              <Text style={styles.activeFiltersLabel}>Filters:</Text>
              
              {/* Category chips */}
              {activeCategoryObjects.map((cat) => (
                <View key={cat.id} style={styles.activeChip}>
                  <Text style={styles.activeChipText}>Category: {cat.name}</Text>
                  <Pressable
                    onPress={() => {
                      setActiveCategories(activeCategories.filter((id) => id !== cat.id))
                      router.setParams({ category: undefined })
                    }}
                    style={styles.chipRemoveBtn}
                    hitSlop={6}
                  >
                    <Text style={styles.chipRemoveText}>✕</Text>
                  </Pressable>
                </View>
              ))}

              {/* Price range chip */}
              {(priceMin !== null || priceMax !== null) && (
                <View style={styles.activeChip}>
                  <Text style={styles.activeChipText}>
                    Price: {priceMin !== null ? `${priceMin} BDT` : "0 BDT"} — {priceMax !== null ? `${priceMax} BDT` : "Any"}
                  </Text>
                  <Pressable
                    onPress={() => {
                      setPriceMin(null)
                      setPriceMax(null)
                    }}
                    style={styles.chipRemoveBtn}
                    hitSlop={6}
                  >
                    <Text style={styles.chipRemoveText}>✕</Text>
                  </Pressable>
                </View>
              )}

              {/* Sort chip */}
              {sortBy !== "created_at" && (
                <View style={styles.activeChip}>
                  <Text style={styles.activeChipText}>
                    Sort: {sortBy === "best_selling" ? "Best Selling" : sortBy === "price_asc" ? "Price ↑" : "Price ↓"}
                  </Text>
                  <Pressable
                    onPress={() => {
                      setSortBy("created_at")
                      router.setParams({ sortBy: undefined })
                    }}
                    style={styles.chipRemoveBtn}
                    hitSlop={6}
                  >
                    <Text style={styles.chipRemoveText}>✕</Text>
                  </Pressable>
                </View>
              )}

              <Pressable onPress={clearAllFilters} style={styles.clearAllBtn} hitSlop={8}>
                <Text style={styles.clearAllText}>Clear All</Text>
              </Pressable>
            </ScrollView>
          </View>
        ) : null}
      </View>

      <View style={styles.grid}>
        {loading ? (
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <ZahanSpinner size={48} />
          </View>
        ) : (
          <ProductGrid
            products={products}
            loading={loading}
            loadingMore={loadingMore}
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
        )}
      </View>

      <FilterBottomSheet
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        categories={categories}
        initialSortBy={sortBy}
        initialCategories={activeCategories}
        initialPriceMin={priceMin}
        initialPriceMax={priceMax}
        onApply={(newSortBy, newCategory, minPrice, maxPrice, categoriesList) => {
          setSortBy(newSortBy)
          setActiveCategories(categoriesList || [])
          setPriceMin(minPrice)
          setPriceMax(maxPrice)

          const firstCatId = categoriesList?.[0]
          const catObj = categories.find((c) => c.id === firstCatId)
          router.setParams({
            category: catObj ? catObj.handle : undefined,
            sortBy: newSortBy !== "created_at" ? newSortBy : undefined,
          })
        }}
      />
    </Screen>
  )
}

const styles = StyleSheet.create({
  headerArea: {
    backgroundColor: "white",
    zIndex: 20,
  },
  searchRow: {
    paddingHorizontal: spacing.md, // px-4
    paddingTop: 16, // pt-4
    paddingBottom: 12, // pb-3
  },
  suggestWrap: {
    marginTop: 8,
  },
  resultsHeader: {
    paddingHorizontal: spacing.md,
    paddingBottom: 8,
  },
  filters: {
    paddingBottom: 12, // pb-3 (sort row container pb)
  },
  sortRow: {
    flexDirection: "row",
    gap: 8, // gap-2
    paddingHorizontal: spacing.md, // px-4
  },
  sortChip: {
    paddingHorizontal: spacing.md, // px-4
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
    paddingTop: spacing.md,
  },
  empty: {
    alignItems: "center",
    paddingVertical: 64, // py-16
  },
  activeFiltersRow: {
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  activeFiltersScroll: {
    paddingHorizontal: spacing.md,
    alignItems: "center",
    gap: 8,
  },
  activeFiltersLabel: {
    fontFamily: fontFamily.interSemiBold,
    fontSize: fontSize.xs,
    color: colors.grey[50],
    marginRight: 4,
  },
  activeChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.grey[10],
    borderWidth: 1,
    borderColor: colors.grey[20],
    borderRadius: 9999,
    paddingLeft: 10,
    paddingRight: 6,
    paddingVertical: 4,
    gap: 6,
  },
  activeChipText: {
    fontFamily: fontFamily.interMedium,
    fontSize: fontSize.xs,
    color: colors.grey[80],
  },
  chipRemoveBtn: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.grey[30],
    justifyContent: "center",
    alignItems: "center",
  },
  chipRemoveText: {
    fontSize: 8,
    color: colors.grey[70],
    fontWeight: "bold",
  },
  clearAllBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  clearAllText: {
    fontFamily: fontFamily.interSemiBold,
    fontSize: fontSize.xs,
    color: colors.brand.teal,
  },
  priceRangeBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.grey[5],
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.grey[20],
  },
  priceRangeLabel: {
    fontFamily: fontFamily.interMedium,
    fontSize: fontSize.xs,
    color: colors.grey[60],
  },
  priceRangeValue: {
    fontFamily: fontFamily.interSemiBold,
    color: colors.brand.teal,
  },
  productCountText: {
    fontFamily: fontFamily.interMedium,
    fontSize: fontSize.xs,
    color: colors.grey[50],
  },
})
