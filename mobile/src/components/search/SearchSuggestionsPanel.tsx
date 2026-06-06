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
import { useAppTheme } from "@hooks/useAppTheme";
import { spacing, borderRadius, shadows } from "@design/theme"

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
  const { colors } = useAppTheme();

  const term = query.trim()
  const showPanel = term.length >= 2

  if (!showPanel) {
    return (
      <View style={[styles.hint, variant === "full" && styles.hintFull]}>
        <ThemedText variant="bodySmall" color={colors.textMuted} style={styles.hintText}>
          Try searching for product names, categories, or collections
        </ThemedText>
      </View>
    )
  }

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.primary} />
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
        <Search size={28} color={colors.border} />
        <ThemedText variant="bodyMedium" color={colors.textMuted}>
          No results for "{term}"
        </ThemedText>
        <ThemedText variant="bodySmall" color={colors.textMuted}>
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
        variant === "dropdown" && [styles.dropdownList, { backgroundColor: colors.background, borderColor: colors.border }],
      ]}
    >
      {suggestions.products.length > 0 ? (
        <Section title="Products">
          {suggestions.products.map((p) => (
            <Pressable
              key={p.id}
              style={[styles.row, { borderBottomColor: colors.border }]}
              onPress={() => onSelectProduct(p.handle)}
            >
              {p.thumbnail ? (
                <Image
                  source={p.thumbnail}
                  style={[styles.thumb, { backgroundColor: colors.border }]}
                  contentFit="cover"
                />
              ) : (
                <View style={[styles.thumb, styles.thumbPlaceholder, { backgroundColor: colors.border }]}>
                  <Search size={14} color={colors.textMuted} />
                </View>
              )}
              <View style={styles.rowBody}>
                <ThemedText variant="bodyMedium" color={colors.text} numberOfLines={1}>
                  {p.title}
                </ThemedText>
                {p.category ? (
                  <ThemedText variant="bodySmall" color={colors.textMuted} numberOfLines={1}>
                    {p.category}
                  </ThemedText>
                ) : null}
              </View>
              <ChevronRight size={16} color={colors.textMuted} />
            </Pressable>
          ))}
        </Section>
      ) : null}

      {suggestions.categories.length > 0 ? (
        <Section title="Categories">
          {suggestions.categories.map((c) => (
            <Pressable
              key={c.id}
              style={[styles.row, { borderBottomColor: colors.border }]}
              onPress={() => onSelectCategory(c.handle)}
            >
              <View style={[styles.thumb, styles.iconThumb, { backgroundColor: colors.primaryMuted }]}>
                <FolderOpen size={16} color={colors.primary} />
              </View>
              <ThemedText variant="body" color={colors.text} style={styles.flex}>
                {c.name}
              </ThemedText>
              <ChevronRight size={16} color={colors.textMuted} />
            </Pressable>
          ))}
        </Section>
      ) : null}

      {suggestions.collections.length > 0 ? (
        <Section title="Collections">
          {suggestions.collections.map((c) => (
            <Pressable
              key={c.id}
              style={[styles.row, { borderBottomColor: colors.border }]}
              onPress={() => onSelectCollection(c.title)}
            >
              <View style={[styles.thumb, styles.iconThumb, { backgroundColor: colors.primaryMuted }]}>
                <Layers size={16} color={colors.primary} />
              </View>
              <ThemedText variant="body" color={colors.text} style={styles.flex}>
                {c.title}
              </ThemedText>
              <ChevronRight size={16} color={colors.textMuted} />
            </Pressable>
          ))}
        </Section>
      ) : null}

      {suggestions.popular.length > 0 ? (
        <Section title="Popular">
          {suggestions.popular.map((p) => (
            <Pressable
              key={p}
              style={[styles.row, { borderBottomColor: colors.border }]}
              onPress={() => onSelectPopular(p)}
            >
              <View style={[styles.thumb, styles.iconThumb, { backgroundColor: colors.primaryMuted }]}>
                <TrendingUp size={16} color={colors.textMuted} />
              </View>
              <ThemedText variant="body" color={colors.text} style={styles.flex}>
                {p}
              </ThemedText>
            </Pressable>
          ))}
        </Section>
      ) : null}

      <Pressable style={[styles.viewAll, { backgroundColor: colors.primaryMuted }]} onPress={() => onViewAll(term)}>
        <Search size={16} color={colors.primary} />
        <ThemedText variant="bodyMedium" color={colors.primary}>
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
  const { colors } = useAppTheme();

  return (
    <View style={styles.section}>
      <ThemedText variant="bodySmall" color={colors.textMuted} style={styles.sectionTitle}>
        {title}
      </ThemedText>
      <View style={[styles.sectionCard, { backgroundColor: colors.background }]}>{children}</View>
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
    borderRadius: borderRadius.rounded,
    borderWidth: 1,
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
  },
  rowBody: {
    flex: 1,
    gap: 2,
  },
  thumb: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.base,
  },
  thumbPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  iconThumb: {
    alignItems: "center",
    justifyContent: "center",
  },
  viewAll: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    margin: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.rounded,
  },
})
