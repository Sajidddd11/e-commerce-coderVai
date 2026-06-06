import { ScrollView, Pressable, View, StyleSheet } from "react-native"
import { Image } from "expo-image"
import { useRouter } from "expo-router"
import { HttpTypes } from "@medusajs/types"
import { colors, spacing, borderRadius } from "@design/theme"
import { ThemedText } from "../ui/ThemedText"

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
            <ThemedText
              variant="bodySmall"
              color={colors.grey[80]}
              numberOfLines={1}
              style={styles.label}
            >
              {category.name}
            </ThemedText>
          </Pressable>
        )
      })}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.base,
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.sm,
  },
  tile: {
    width: 80,
    alignItems: "center",
    gap: spacing.xs,
  },
  imageWrap: {
    width: 72,
    height: 72,
    borderRadius: borderRadius.circle,
    overflow: "hidden",
    backgroundColor: colors.grey[10],
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
  },
})
