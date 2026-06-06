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
          variant="nav"
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
      contentContainerStyle={styles.container}
    >
      {renderChip(null, "All")}
      {categories.map((c) => renderChip(c.id, c.name))}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.circle,
  },
})
