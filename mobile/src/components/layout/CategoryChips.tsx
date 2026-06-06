import { ScrollView, Pressable, StyleSheet } from "react-native"
import { HttpTypes } from "@medusajs/types"
import { colors, spacing, borderRadius } from "@design/theme"
import { ThemedText } from "../ui/ThemedText"

interface CategoryChipsProps {
  categories: HttpTypes.StoreProductCategory[]
  activeId?: string | null
  onSelect: (id: string | null) => void
}

export function CategoryChips({
  categories,
  activeId,
  onSelect,
}: CategoryChipsProps) {
  const renderChip = (id: string | null, label: string) => {
    const active = activeId === id || (id === null && !activeId)
    return (
      <Pressable
        key={id ?? "all"}
        onPress={() => onSelect(id)}
        style={[
          styles.chip,
          {
            backgroundColor: active ? colors.slate[900] : colors.grey[10],
          },
        ]}
      >
        <ThemedText
          variant="bodySmall"
          color={active ? colors.grey[0] : colors.grey[70]}
        >
          {label}
        </ThemedText>
      </Pressable>
    )
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scroll}
      contentContainerStyle={styles.container}
    >
      {renderChip(null, "All")}
      {categories.map((c) => renderChip(c.id, c.name))}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 0,
    flexShrink: 0,
  },
  container: {
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.base,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.circle,
    alignSelf: "center",
  },
})
