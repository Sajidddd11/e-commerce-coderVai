import { ScrollView, Pressable, View, StyleSheet, Text } from "react-native"
import { Image } from "expo-image"
import { useRouter } from "expo-router"
import { HttpTypes } from "@medusajs/types"
import { colors, spacing } from "@design/theme"
import { fontFamily, fontSize } from "@design/typography"

interface CategoryTilesProps {
  categories: HttpTypes.StoreProductCategory[]
}

const categoryImages: Record<string, any> = {
  "sneakers": require("../../../assets/categories/sneakers.png"),
  "bags": require("../../../assets/categories/bags.png"),
  "home-appliances": require("../../../assets/categories/home-appliances.png"),
  "jerseys": require("../../../assets/categories/jerseys.png"),
  "watches": require("../../../assets/categories/watches.png"),
  "headphones": require("../../../assets/categories/headphones.png"),
  "electric-products": require("../../../assets/categories/electric-products.png"),
  "pets": require("../../../assets/categories/pets.png"),
}

export function CategoryTiles({ categories }: CategoryTilesProps) {
  const router = useRouter()

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {categories.map((category) => {
        // Fallback to product thumbnail if no specific category image
        const thumb = categoryImages[category.handle] || (category as any).products?.[0]?.thumbnail
        return (
          <Pressable
            key={category.id}
            style={styles.tile}
            onPress={() =>
              router.push({
                pathname: "/(tabs)/shop",
                params: { category: category.handle },
              })
            }
          >
            <View style={styles.imageWrap}>
              {thumb ? (
                <Image source={thumb} style={styles.image} contentFit="cover" />
              ) : (
                <View style={[styles.image, styles.placeholder]} />
              )}
            </View>
            <Text
              numberOfLines={1}
              style={styles.label}
            >
              {category.name}
            </Text>
          </Pressable>
        )
      })}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 16, // gap-4 in tailwind
    paddingHorizontal: spacing.md, // px-4
    paddingBottom: 4, // pb-1
  },
  tile: {
    alignItems: "center",
    gap: 6, // gap-1.5
  },
  imageWrap: {
    width: 64, // w-16
    height: 64, // h-16
    borderRadius: 32, // rounded-full
    borderWidth: 2,
    borderColor: "#E5E7EB", // border-gray-200
    overflow: "hidden",
    backgroundColor: colors.grey[10], // bg-gray-100
  },
  image: {
    width: "100%",
    height: "100%",
  },
  placeholder: {
    backgroundColor: colors.grey[20],
  },
  label: {
    textAlign: "center",
    fontFamily: fontFamily.interMedium,
    color: "#111827", // text-gray-900 (matches oklch)
    fontSize: fontSize[11], // text-[11px]
  },
})
