import { View, Pressable, StyleSheet } from "react-native"
import { useRouter } from "expo-router"
import { Search } from "lucide-react-native"
import { colors, spacing, borderRadius } from "@design/theme"
import { ThemedText } from "../ui/ThemedText"

interface HeaderProps {
  showSearch?: boolean
}

export function Header({ showSearch = true }: HeaderProps) {
  const router = useRouter()

  return (
    <View style={styles.header}>
      <Pressable onPress={() => router.push("/(tabs)")}>
        <ThemedText variant="brand" color={colors.grey[90]} style={styles.logo}>
          ZAHAN
        </ThemedText>
      </Pressable>

      {showSearch ? (
        <Pressable
          style={styles.searchPill}
          onPress={() => router.push("/(tabs)/shop")}
          accessibilityRole="search"
          accessibilityLabel="Search products"
        >
          <Search size={18} color={colors.grey[50]} />
          <ThemedText variant="bodySmall" color={colors.grey[50]}>
            Search products
          </ThemedText>
        </Pressable>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.base,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    backgroundColor: colors.grey[0],
    borderBottomWidth: 1,
    borderBottomColor: colors.grey[20],
  },
  logo: {
    letterSpacing: 2,
  },
  searchPill: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.grey[10],
    borderRadius: borderRadius.rounded,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
  },
})
