import { View, Pressable, StyleSheet } from "react-native"
import { ChevronRight } from "lucide-react-native"
import { colors, spacing } from "@design/theme"
import { ThemedText } from "../ui/ThemedText"

interface SectionHeaderProps {
  title: string
  onSeeAll?: () => void
}

export function SectionHeader({ title, onSeeAll }: SectionHeaderProps) {
  return (
    <View style={styles.row}>
      <ThemedText variant="sectionHeading" color={colors.grey[90]}>
        {title}
      </ThemedText>
      {onSeeAll ? (
        <Pressable style={styles.seeAll} onPress={onSeeAll}>
          <ThemedText variant="nav" color={colors.brand.teal}>
            See all
          </ThemedText>
          <ChevronRight size={16} color={colors.brand.teal} />
        </Pressable>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
  },
  seeAll: {
    flexDirection: "row",
    alignItems: "center",
  },
})
