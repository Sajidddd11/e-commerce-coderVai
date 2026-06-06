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
          style={styles.searchField}
          onPress={() => router.push("/search")}
          accessibilityRole="search"
          accessibilityLabel="Search products"
        >
          <ThemedText
            variant="body"
            color={colors.grey[40]}
            style={styles.placeholder}
            numberOfLines={1}
          >
            Search products...
          </ThemedText>
          <View style={styles.searchBtn}>
            <Search size={18} color={colors.grey[50]} />
          </View>
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
  searchField: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.grey[0],
    borderRadius: borderRadius.rounded,
    borderWidth: 2,
    borderColor: colors.grey[20],
    paddingLeft: spacing.base,
    paddingRight: spacing.xs,
    minHeight: 40,
  },
  placeholder: {
    flex: 1,
  },
  searchBtn: {
    padding: spacing.sm,
  },
})
