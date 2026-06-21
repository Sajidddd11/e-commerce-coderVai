import { useEffect, useState } from "react"
import { Pressable, View, StyleSheet, Text } from "react-native"
import { Image } from "expo-image"
import { Link } from "expo-router"
import { Heart } from "lucide-react-native"
import { HttpTypes } from "@medusajs/types"
import { getProductPrice } from "@utils/get-product-price"
import { masonryAspectForIndex } from "@utils/masonry-columns"
import { getProductReviews } from "@api/enhancements"
import { colors, shadows, borderRadius } from "@design/theme"
import { fontFamily, fontSize } from "@design/typography"
import { ProductPrice } from "./ProductPrice"

interface ProductCardProps {
  product: HttpTypes.StoreProduct
  width?: number
  masonryIndex?: number
  squareImage?: boolean
  variant?: "home" | "shop"
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
  variant = "shop",
}: ProductCardProps) {
  const [rating, setRating] = useState<number | null>(null)
  const [wishlisted, setWishlisted] = useState(false)

  useEffect(() => {
    if (!product?.id) return
    let mounted = true
    getProductReviews(product.id).then((res) => {
      if (mounted && res.average > 0) setRating(res.average)
    })
    return () => {
      mounted = false
    }
  }, [product?.id])

  if (!product?.id) return null

  const { cheapestPrice } = getProductPrice({ product })
  const onSale =
    cheapestPrice?.price_type === "sale" &&
    cheapestPrice.original_price_number > cheapestPrice.calculated_price_number
  const discountPct = onSale ? cheapestPrice?.percentage_diff : null
  const thumbnail = product.thumbnail || product.images?.[0]?.url
  const inStock = isInStock(product)
  const isNew = isNewProduct(product)

  const aspectRatio =
    squareImage || masonryIndex === undefined
      ? 1
      : masonryAspectForIndex(masonryIndex)

  const isHome = variant === "home"

  return (
    <Link href={`/product/${product.handle}`} asChild>
      <Pressable
        style={({ pressed }) => [
          styles.card,
          width != null ? { width } : styles.fill,
          shadows.sm,
          { transform: [{ scale: pressed ? 0.97 : 1 }] },
        ]}
      >
        <View style={styles.innerCard}>
          {/* Image container */}
          <View style={[styles.imageWrap, { aspectRatio }]}>
            <Image
              source={thumbnail}
              placeholder={BLUR_HASH}
              contentFit="cover"
              transition={200}
              style={styles.image}
            />



            {/* Sale badge top-left */}
            {onSale && discountPct ? (
              <View style={[styles.topLeftBadge, { backgroundColor: "#EF4444" }]}>
                <Text style={styles.badgeText}>{discountPct}% off</Text>
              </View>
            ) : isNew ? (
              <View style={[styles.topLeftBadge, { backgroundColor: colors.brand.teal }]}>
                <Text style={styles.badgeText}>New</Text>
              </View>
            ) : null}

            {/* Original price badge bottom-left */}
            {onSale && cheapestPrice?.original_price ? (
              <View style={styles.bottomLeftBadge}>
                <Text style={styles.strikeBadgeText}>
                  {cheapestPrice.original_price}
                </Text>
              </View>
            ) : null}

            {/* Out of stock overlay */}
            {!inStock ? (
              <View style={styles.soldOut}>
                <Text style={styles.soldOutText}>Out of stock</Text>
              </View>
            ) : null}
          </View>

          {/* Footer: name + price */}
          <View style={styles.footer}>
            <Text numberOfLines={2} style={styles.name}>
              {product.title}
            </Text>
            <View style={styles.priceRow}>
              <ProductPrice product={product} compact />
            </View>
          </View>
        </View>
      </Pressable>
    </Link>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: borderRadius.large,
  },
  innerCard: {
    borderRadius: borderRadius.large,
    overflow: "hidden",
  },
  fill: {
    width: "100%",
  },
  imageWrap: {
    width: "100%",
    backgroundColor: "#F3F4F6",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },

  topLeftBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    zIndex: 2,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: fontSize[10],
    fontFamily: fontFamily.interSemiBold,
    letterSpacing: 0.2,
  },
  bottomLeftBadge: {
    position: "absolute",
    bottom: 8,
    left: 8,
    zIndex: 2,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
  },
  strikeBadgeText: {
    color: "#6B7280",
    fontSize: fontSize[10],
    fontFamily: fontFamily.interMedium,
    textDecorationLine: "line-through",
  },
  soldOut: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 23, 42, 0.5)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 4,
  },
  soldOutText: {
    fontFamily: fontFamily.interSemiBold,
    color: "#FFFFFF",
    fontSize: fontSize[13],
  },
  footer: {
    paddingHorizontal: 10,
    paddingTop: 9,
    paddingBottom: 10,
    backgroundColor: colors.grey[10],
    gap: 3,
  },
  name: {
    fontFamily: fontFamily.interMedium,
    fontSize: fontSize[13],
    color: "#111827",
    lineHeight: 18,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
  },
})
