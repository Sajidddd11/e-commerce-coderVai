import { View, Pressable, StyleSheet, Text } from "react-native"
import { ChevronRight } from "lucide-react-native"
import { colors, spacing } from "@design/theme"

interface SectionHeaderProps {
  title: string
  onSeeAll?: () => void
}

export function SectionHeader({ title, onSeeAll }: SectionHeaderProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.title}>
        {title}
      </Text>
      {onSeeAll ? (
        <Pressable style={styles.seeAll} onPress={onSeeAll}>
          <Text style={styles.seeAllText}>
            See all
          </Text>
          <ChevronRight size={12} color={colors.brand.teal} />
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
    paddingHorizontal: spacing.md,
    marginBottom: 12, // mb-3
    marginTop: 20, // mt-5 applied to the wrapper in the demo
  },
  title: {
    color: colors.slate[900],
    fontSize: 20, // text-xl
    fontWeight: "700", // font-bold
    lineHeight: 28, // leading-7
    letterSpacing: -0.5, // tracking-tight
  },
  seeAll: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2, // gap-0.5
  },
  seeAllText: {
    color: colors.brand.teal,
    fontSize: 12, // text-xs
    fontWeight: "600", // font-semibold
    lineHeight: 16, // leading-4
  },
})
