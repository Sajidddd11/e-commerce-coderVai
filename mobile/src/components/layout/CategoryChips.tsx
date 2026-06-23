import { ScrollView, Pressable, StyleSheet, Text } from "react-native"
import { HttpTypes } from "@medusajs/types"
import { colors, spacing } from "@design/theme"
import { fontFamily, fontSize } from "@design/typography"

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
          active ? styles.chipActive : styles.chipInactive,
        ]}
      >
        <Text
          style={[
            styles.chipText,
            active ? styles.chipTextActive : styles.chipTextInactive,
          ]}
        >
          {label}
        </Text>
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
    gap: 8, // gap-2
    paddingHorizontal: spacing.md, // px-4
    paddingBottom: 4, // pb-1
  },
  chip: {
    paddingHorizontal: spacing.md, // px-4
    height: 32, // h-8
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 9999, // rounded-full
    borderStyle: "solid",
  },
  chipActive: {
    backgroundColor: "rgba(86, 174, 191, 0.1)", // bg-[#56aebf]/10
    borderColor: "#56AEBF", // border-[#56AEBF]
    borderWidth: 2,
  },
  chipInactive: {
    backgroundColor: "white",
    borderColor: "#E5E7EB", // border-gray-200
    borderWidth: 1,
  },
  chipText: {
    fontFamily: fontFamily.interMedium,
    fontSize: fontSize.xs, // text-xs
    lineHeight: 16, // leading-4
  },
  chipTextActive: {
    fontFamily: fontFamily.interSemiBold,
    color: "#56AEBF", // text-[#56AEBF]
  },
  chipTextInactive: {
    fontFamily: fontFamily.interMedium,
    color: "#6B7280", // text-gray-500
  },
})
