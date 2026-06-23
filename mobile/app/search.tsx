import { useState } from "react"
import { View, Pressable, StyleSheet } from "react-native"
import { useRouter } from "expo-router"
import { ChevronLeft } from "lucide-react-native"
import { Screen } from "@components/layout/Screen"
import { ThemedText } from "@components/ui/ThemedText"
import { ProductSearchBar } from "@components/search/ProductSearchBar"
import { SearchSuggestionsPanel } from "@components/search/SearchSuggestionsPanel"
import { useSearchSuggestions } from "@hooks/useSearchSuggestions"
import { colors, spacing } from "@design/theme"

export default function SearchScreen() {
  const router = useRouter()
  const [input, setInput] = useState("")
  const { suggestions, loading } = useSearchSuggestions(input)

  const goToShop = (term: string) => {
    const q = term.trim()
    if (!q) return
    router.replace({ pathname: "/(tabs)/shop", params: { q } })
  }

  return (
    <Screen>
      <View style={styles.top}>
        <Pressable onPress={() => router.back()} style={styles.back} hitSlop={8}>
          <ChevronLeft size={24} color={colors.grey[90]} />
        </Pressable>
        <ThemedText variant="subheading" color={colors.grey[90]}>
          Search
        </ThemedText>
      </View>

      <View style={styles.bar}>
        <ProductSearchBar
          value={input}
          onChangeText={setInput}
          onSubmit={goToShop}
          onClear={() => setInput("")}
          autoFocus
        />
      </View>

      <SearchSuggestionsPanel
        query={input}
        suggestions={suggestions}
        loading={loading}
        variant="full"
        onSelectProduct={(handle) => {
          router.push(`/product/${handle}`)
        }}
        onSelectCategory={(handle) => {
          router.replace({ pathname: "/(tabs)/shop", params: { category: handle } })
        }}
        onSelectCollection={(title) => goToShop(title)}
        onSelectPopular={goToShop}
        onViewAll={goToShop}
      />
    </Screen>
  )
}

const styles = StyleSheet.create({
  top: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.grey[20],
  },
  back: {
    padding: spacing.xs,
  },
  bar: {
    padding: spacing.base,
  },
})
