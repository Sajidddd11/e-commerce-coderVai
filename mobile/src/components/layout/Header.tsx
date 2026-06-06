import { View, Pressable, StyleSheet, Text } from "react-native"
import { useRouter } from "expo-router"
import { Search } from "lucide-react-native"
import { colors } from "@design/theme"
import { fontFamily, fontSize } from "@design/typography"
import { useAnimatedPlaceholder } from "@hooks/useAnimatedPlaceholder"

interface HeaderProps {
  showSearch?: boolean
}

export function Header({ showSearch = true }: HeaderProps) {
  const router = useRouter()
  const animatedPlaceholder = useAnimatedPlaceholder()

  return (
    <View style={styles.header}>
      {showSearch ? (
        <Pressable
          style={styles.searchField}
          onPress={() => router.push("/search")}
          accessibilityRole="search"
          accessibilityLabel="Search products"
        >
          <Text
            style={styles.placeholder}
            numberOfLines={1}
          >
            {animatedPlaceholder}
          </Text>
          <View style={styles.searchBtn}>
            <Search size={12} color="white" />
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
    paddingHorizontal: 16, // px-4
    paddingTop: 12, // Reduced from 40
    paddingBottom: 12, // pb-3
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB", // border-gray-200
  },
  searchField: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 9999, // rounded-full
    borderWidth: 2,
    borderColor: "#E5E7EB", // border-gray-200 / border-black/1
    paddingLeft: 12, // px-3
    paddingRight: 6, // roughly py-1.5 equivalent
    paddingVertical: 6, // py-1.5
    gap: 8, // gap-2
  },
  placeholder: {
    flex: 1,
    fontFamily: fontFamily.interRegular,
    fontSize: fontSize.xs, // text-xs
    color: "#6B7280", // text-gray-500
  },
  searchBtn: {
    width: 24, // w-6
    height: 24, // h-6
    borderRadius: 12, // rounded-full
    backgroundColor: "#56AEBF", // bg-[#56AEBF]
    justifyContent: "center",
    alignItems: "center",
  },
})
