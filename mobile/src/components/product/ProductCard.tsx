import { Pressable, View, StyleSheet } from "react-native"
import { Image } from "expo-image"
import { Link } from "expo-router"
import { HttpTypes } from "@medusajs/types"
import { getProductPrice } from "@utils/get-product-price"
import { masonryAspectForIndex } from "@utils/masonry-columns"
import { colors, borderRadius, shadows, spacing } from "@design/theme"
import { ThemedText } from "../ui/ThemedText"
import { Badge } from "../ui/Badge"
import { ProductPrice } from "./ProductPrice"

interface ProductCardProps {
  product: HttpTypes.StoreProduct
  /** Fixed width for horizontal rails; omit for full-width masonry/grid cells. */
  width?: number
  /** Pinterest-style variable image height (shop grid). */
  masonryIndex?: number
  /** Force square images (rails). */
  squareImage?: boolean
}

const BLUR_HASH = "L6PZfSi_.AyE_3t7t7R**0o#DgR4"

function isInStock(product: HttpTypes.StoreProduct): boolean {
  if (!product.variants?.length) return true
  return product.variants.some((v) => {
    if (!v.manage_inventory) return true
    return (v.inventory_quantity ?? 0) > 0
  })
}

function isNewProduct(product: HttpTypes.StoreProduct): boolean {
  if (!product.created_at) return false
  const created = new Date(product.created_at).getTime()
  const thirtyDays = 30 * 24 * 60 * 60 * 1000
  return Date.now() - created < thirtyDays
}

export function ProductCard({
  product,
  width,
  masonryIndex,
  squareImage = false,
}: ProductCardProps) {
  if (!product?.id) return null

  const { cheapestPrice } = getProductPrice({ product })
  const onSale =
    cheapestPrice?.price_type === "sale" &&
    cheapestPrice.original_price_number > cheapestPrice.calculated_price_number
  const discountPct = onSale ? cheapestPrice?.percentage_diff : null
  const thumbnail = product.thumbnail || product.images?.[0]?.url
  const inStock = isInStock(product)
  const isNew = isNewProduct(product)
  const productType = product.type?.value

  const aspectRatio =
    squareImage || masonryIndex === undefined
      ? 1
      : masonryAspectForIndex(masonryIndex)

  return (
    <Link href={`/product/${product.handle}`} asChild>
      <Pressable
        style={({ pressed }) => [
          styles.card,
          width != null ? { width } : styles.fill,
          shadows.sm,
          { transform: [{ scale: pressed ? 0.98 : 1 }] },
        ]}
      >
        <View style={[styles.imageWrap, { aspectRatio }]}>
          <Image
            source={thumbnail}
            placeholder={BLUR_HASH}
            contentFit="cover"
            transition={200}
            style={styles.image}
          />

          <View style={styles.badgeRow}>
            {onSale && discountPct ? (
              <Badge label={`${discountPct}% off`} variant="sale" />
            ) : isNew ? (
              <Badge label="New" variant="new" />
            ) : null}
          </View>

          {onSale && cheapestPrice ? (
            <View style={styles.originalBadge}>
              <ThemedText
                variant="bodySmall"
                color={colors.grey[0]}
                style={styles.originalStrike}
              >
                {cheapestPrice.original_price}
              </ThemedText>
            </View>
          ) : null}

          {!inStock ? (
            <View style={styles.soldOut}>
              <ThemedText variant="bodySmall" color={colors.grey[0]} style={styles.soldOutText}>
                Out of stock
              </ThemedText>
            </View>
          ) : null}
        </View>

        <View style={styles.footer}>
          {productType ? (
            <ThemedText
              variant="bodySmall"
              color={colors.grey[50]}
              numberOfLines={1}
              style={styles.type}
            >
              {productType.toUpperCase()}
            </ThemedText>
          ) : null}

          <ThemedText
            variant="body"
            color={colors.grey[90]}
            numberOfLines={2}
            style={styles.title}
          >
            {product.title}
          </ThemedText>

          <ProductPrice product={product} compact />
        </View>
      </Pressable>
    </Link>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.grey[0],
    borderRadius: borderRadius.rounded,
    overflow: "hidden",
  },
  fill: {
    width: "100%",
  },
  imageWrap: {
    width: "100%",
    backgroundColor: colors.grey[10],
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  badgeRow: {
    position: "absolute",
    top: spacing.sm,
    left: spacing.sm,
    zIndex: 2,
  },
  originalBadge: {
    position: "absolute",
    bottom: spacing.xs,
    right: 0,
    backgroundColor: colors.slate[900],
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    zIndex: 2,
  },
  originalStrike: {
    textDecorationLine: "line-through",
    fontWeight: "600",
  },
  soldOut: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 3,
  },
  soldOutText: {
    fontWeight: "700",
  },
  footer: {
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
    gap: 2,
    backgroundColor: colors.grey[10],
    alignItems: "flex-start",
  },
  type: {
    letterSpacing: 0.6,
    fontWeight: "600",
  },
  title: {
    width: "100%",
    lineHeight: 20,
  },
})
