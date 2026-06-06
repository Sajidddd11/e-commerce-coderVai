import { View, Pressable, ScrollView, StyleSheet, ActivityIndicator } from "react-native"
import { Image } from "expo-image"
import {
  Search,
  FolderOpen,
  Layers,
  TrendingUp,
  ChevronRight,
} from "lucide-react-native"
import { ThemedText } from "@components/ui/ThemedText"
import type { SearchSuggestionsResult } from "@api/enhancements"
import { colors, spacing, borderRadius, shadows } from "@design/theme"

interface SearchSuggestionsPanelProps {
  query: string
  suggestions: SearchSuggestionsResult
  loading?: boolean
  onSelectProduct: (handle: string) => void
  onSelectCategory: (handle: string) => void
  onSelectCollection: (title: string) => void
  onSelectPopular: (term: string) => void
  onViewAll: (term: string) => void
  /** Inline dropdown vs full-page list */
  variant?: "dropdown" | "full"
}

export function SearchSuggestionsPanel({
  query,
  suggestions,
  loading,
  onSelectProduct,
  onSelectCategory,
  onSelectCollection,
  onSelectPopular,
  onViewAll,
  variant = "dropdown",
}: SearchSuggestionsPanelProps) {
  const term = query.trim()
  const showPanel = term.length >= 2

  if (!showPanel) {
    return (
      <View style={[styles.hint, variant === "full" && styles.hintFull]}>
        <ThemedText variant="bodySmall" color={colors.grey[50]} style={styles.hintText}>
          Try searching for product names, categories, or collections
        </ThemedText>
      </View>
    )
  }

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.brand.teal} />
      </View>
    )
  }

  const hasResults =
    suggestions.products.length > 0 ||
    suggestions.categories.length > 0 ||
    suggestions.collections.length > 0 ||
    suggestions.popular.length > 0

  if (!hasResults) {
    return (
      <View style={styles.empty}>
        <Search size={28} color={colors.grey[30]} />
        <ThemedText variant="bodyMedium" color={colors.grey[70]}>
          No results for "{term}"
        </ThemedText>
        <ThemedText variant="bodySmall" color={colors.grey[50]}>
          Try a different spelling or browse categories
        </ThemedText>
      </View>
    )
  }

  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      style={variant === "full" ? styles.fullList : undefined}
      contentContainerStyle={[
        styles.list,
        variant === "dropdown" && styles.dropdownList,
      ]}
    >
      {suggestions.products.length > 0 ? (
        <Section title="Products">
          {suggestions.products.map((p) => (
            <Pressable
              key={p.id}
              style={styles.row}
              onPress={() => onSelectProduct(p.handle)}
            >
              {p.thumbnail ? (
                <Image
                  source={p.thumbnail}
                  style={styles.thumb}
                  contentFit="cover"
                />
              ) : (
                <View style={[styles.thumb, styles.thumbPlaceholder]}>
                  <Search size={14} color={colors.grey[40]} />
                </View>
              )}
              <View style={styles.rowBody}>
                <ThemedText variant="bodyMedium" color={colors.grey[90]} numberOfLines={1}>
                  {p.title}
                </ThemedText>
                {p.category ? (
                  <ThemedText variant="bodySmall" color={colors.grey[50]} numberOfLines={1}>
                    {p.category}
                  </ThemedText>
                ) : null}
              </View>
              <ChevronRight size={16} color={colors.grey[40]} />
            </Pressable>
          ))}
        </Section>
      ) : null}

      {suggestions.categories.length > 0 ? (
        <Section title="Categories">
          {suggestions.categories.map((c) => (
            <Pressable
              key={c.id}
              style={styles.row}
              onPress={() => onSelectCategory(c.handle)}
            >
              <View style={[styles.thumb, styles.iconThumb]}>
                <FolderOpen size={16} color={colors.brand.teal} />
              </View>
              <ThemedText variant="body" color={colors.grey[90]} style={styles.flex}>
                {c.name}
              </ThemedText>
              <ChevronRight size={16} color={colors.grey[40]} />
            </Pressable>
          ))}
        </Section>
      ) : null}

      {suggestions.collections.length > 0 ? (
        <Section title="Collections">
          {suggestions.collections.map((c) => (
            <Pressable
              key={c.id}
              style={styles.row}
              onPress={() => onSelectCollection(c.title)}
            >
              <View style={[styles.thumb, styles.iconThumb]}>
                <Layers size={16} color={colors.brand.teal} />
              </View>
              <ThemedText variant="body" color={colors.grey[90]} style={styles.flex}>
                {c.title}
              </ThemedText>
              <ChevronRight size={16} color={colors.grey[40]} />
            </Pressable>
          ))}
        </Section>
      ) : null}

      {suggestions.popular.length > 0 ? (
        <Section title="Popular">
          {suggestions.popular.map((p) => (
            <Pressable
              key={p}
              style={styles.row}
              onPress={() => onSelectPopular(p)}
            >
              <View style={[styles.thumb, styles.iconThumb]}>
                <TrendingUp size={16} color={colors.grey[50]} />
              </View>
              <ThemedText variant="body" color={colors.grey[90]} style={styles.flex}>
                {p}
              </ThemedText>
            </Pressable>
          ))}
        </Section>
      ) : null}

      <Pressable style={styles.viewAll} onPress={() => onViewAll(term)}>
        <Search size={16} color={colors.brand.teal} />
        <ThemedText variant="bodyMedium" color={colors.brand.teal}>
          See all results for "{term}"
        </ThemedText>
      </Pressable>
    </ScrollView>
  )
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <View style={styles.section}>
      <ThemedText variant="bodySmall" color={colors.grey[50]} style={styles.sectionTitle}>
        {title}
      </ThemedText>
      <View style={styles.sectionCard}>{children}</View>
    </View>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  hint: {
    padding: spacing.base,
  },
  hintFull: {
    paddingTop: spacing.lg,
  },
  hintText: {
    textAlign: "center",
  },
  loading: {
    padding: spacing.xl,
    alignItems: "center",
  },
  empty: {
    padding: spacing["2xl"],
    alignItems: "center",
    gap: spacing.sm,
  },
  fullList: {
    flex: 1,
  },
  list: {
    paddingBottom: spacing.lg,
  },
  dropdownList: {
    maxHeight: 360,
    backgroundColor: colors.grey[0],
    borderRadius: borderRadius.rounded,
    borderWidth: 1,
    borderColor: colors.grey[20],
    ...shadows.lg,
  },
  section: {
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.sm,
  },
  sectionTitle: {
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.xs,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  sectionCard: {
    backgroundColor: colors.grey[0],
    borderRadius: borderRadius.rounded,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.grey[10],
  },
  rowBody: {
    flex: 1,
    gap: 2,
  },
  thumb: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.base,
    backgroundColor: colors.grey[10],
  },
  thumbPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  iconThumb: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.brand.tealMuted,
  },
  viewAll: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    margin: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.rounded,
    backgroundColor: colors.brand.tealMuted,
  },
})
