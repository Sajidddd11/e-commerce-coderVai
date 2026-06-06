import { ScrollView, Pressable, View, StyleSheet, Text } from "react-native"
import { Image } from "expo-image"
import { useRouter } from "expo-router"
import { HttpTypes } from "@medusajs/types"
import { colors } from "@design/theme"
import { fontFamily, fontSize } from "@design/typography"

interface CategoryTilesProps {
  categories: HttpTypes.StoreProductCategory[]
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
        const thumb = (category as any).products?.[0]?.thumbnail
        return (
          <Pressable
            key={category.id}
            style={styles.tile}
            onPress={() => router.push(`/category/${category.handle}`)}
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
    paddingHorizontal: 16, // px-4
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
