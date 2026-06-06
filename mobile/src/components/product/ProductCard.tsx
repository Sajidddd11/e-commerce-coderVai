import { Pressable, View, StyleSheet } from "react-native"
import { Image } from "expo-image"
import { Link } from "expo-router"
import { HttpTypes } from "@medusajs/types"
import { getProductPrice } from "@utils/get-product-price"
import { colors, borderRadius, shadows, spacing } from "@design/theme"
import { ThemedText } from "../ui/ThemedText"
import { Badge } from "../ui/Badge"
import { ProductPrice } from "./ProductPrice"

interface ProductCardProps {
  product: HttpTypes.StoreProduct
}

const BLUR_HASH = "L6PZfSi_.AyE_3t7t7R**0o#DgR4"

export function ProductCard({ product }: ProductCardProps) {
  if (!product?.id) return null
  const { cheapestPrice } = getProductPrice({ product })
  const onSale =
    cheapestPrice?.price_type === "sale" &&
    cheapestPrice.original_price_number > cheapestPrice.calculated_price_number
  const thumbnail = product.thumbnail || product.images?.[0]?.url

  return (
    <Link href={`/product/${product.handle}`} asChild>
      <Pressable
        style={({ pressed }) => [
          styles.card,
          shadows.md,
          { transform: [{ scale: pressed ? 0.98 : 1 }] },
        ]}
      >
        <View style={styles.imageWrap}>
          <Image
            source={thumbnail}
            placeholder={BLUR_HASH}
            contentFit="cover"
            transition={200}
            style={styles.image}
          />
          {onSale && cheapestPrice ? (
            <Badge
              label={`-${cheapestPrice.percentage_diff}%`}
              variant="sale"
              style={styles.badge}
            />
          ) : null}
        </View>

        <View style={styles.footer}>
          <ThemedText
            variant="productTitle"
            color={colors.grey[90]}
            numberOfLines={2}
          >
            {product.title}
          </ThemedText>
          <ProductPrice product={product} />
        </View>
      </Pressable>
    </Link>
  )
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.grey[0],
    borderRadius: borderRadius.rounded,
    overflow: "hidden",
  },
  imageWrap: {
    aspectRatio: 1,
    backgroundColor: colors.grey[10],
  },
  image: {
    width: "100%",
    height: "100%",
  },
  badge: {
    position: "absolute",
    top: spacing.sm,
    left: spacing.sm,
  },
  footer: {
    padding: spacing.md,
    gap: spacing.xs,
    backgroundColor: colors.grey[10],
  },
})
