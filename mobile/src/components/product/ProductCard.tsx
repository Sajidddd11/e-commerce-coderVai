import { useEffect, useState } from "react"
import { Pressable, View, StyleSheet, Text } from "react-native"
import { Image } from "expo-image"
import { Link } from "expo-router"
import { Star } from "lucide-react-native"
import { HttpTypes } from "@medusajs/types"
import { getProductPrice } from "@utils/get-product-price"
import { masonryAspectForIndex } from "@utils/masonry-columns"
import { getProductReviews } from "@api/enhancements"
import { useAppTheme } from "@hooks/useAppTheme"
import { shadows } from "@design/theme"
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
  const { colors } = useAppTheme();

  const [rating, setRating] = useState<number | null>(null)

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
  const productType = product.type?.value

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
          { backgroundColor: colors.background, borderColor: colors.border },
          isHome ? styles.cardHome : styles.cardShop,
          width != null ? { width } : styles.fill,
          shadows.sm,
          { transform: [{ scale: pressed ? 0.98 : 1 }] },
        ]}
      >
        <View style={[styles.inner, isHome ? styles.innerHome : styles.innerShop]}>
          <View style={[styles.imageWrap, { backgroundColor: colors.border, aspectRatio }]}>
            <Image
              source={thumbnail}
              placeholder={BLUR_HASH}
              contentFit="cover"
              transition={200}
              style={styles.image}
            />

            <View style={styles.topLeftBadge}>
              {onSale && discountPct ? (
                <View style={[styles.badge, isHome ? styles.badgeHome : styles.badgeShop, { backgroundColor: "#EF4444" }]}>
                  <Text style={[styles.badgeText, isHome ? styles.badgeTextHome : styles.badgeTextShop]}>{discountPct}% off</Text>
                </View>
              ) : isNew ? (
                <View style={[styles.badge, isHome ? styles.badgeHome : styles.badgeShop, { backgroundColor: "#56AEBF" }]}>
                  <Text style={[styles.badgeText, isHome ? styles.badgeTextHome : styles.badgeTextShop]}>New</Text>
                </View>
              ) : null}
            </View>

            {rating ? (
              <View style={[styles.bottomLeftBadge, { backgroundColor: colors.background }]}>
                <Star size={10} color="#EAB308" fill="#EAB308" />
                <Text style={[styles.ratingText, { color: colors.text }]}>{rating.toFixed(1)}</Text>
              </View>
            ) : null}

            {onSale && cheapestPrice ? (
              <View style={[styles.originalBadge, isHome ? styles.originalBadgeHome : styles.originalBadgeShop]}>
                <Text style={[styles.originalStrike, isHome ? styles.originalStrikeHome : styles.originalStrikeShop]}>
                  {cheapestPrice.original_price}
                </Text>
              </View>
            ) : null}

            {!inStock ? (
              <View style={styles.soldOut}>
                <Text style={styles.soldOutText}>Out of stock</Text>
              </View>
            ) : null}
          </View>

          <View style={[styles.footer, isHome ? styles.footerHome : styles.footerShop, { backgroundColor: colors.background }]}>
            {!isHome ? (
              <Text numberOfLines={1} style={styles.type}>
                {productType ? productType.toUpperCase() : " "}
              </Text>
            ) : null}

            <Text numberOfLines={2} style={[styles.title, { color: colors.text }, isHome ? styles.titleHome : styles.titleShop]}>
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
    borderWidth: 1, // border-1
  },
  cardHome: {
    borderRadius: 12, // rounded-xl
  },
  cardShop: {
    borderRadius: 8, // rounded-lg
  },
  inner: {
    overflow: "hidden",
    flex: 1,
  },
  innerHome: {
    borderRadius: 11, // Slightly less than outer to prevent bleeding
  },
  innerShop: {
    borderRadius: 7,
  },
  fill: {
    width: "100%",
  },
  imageWrap: {
    width: "100%",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  topLeftBadge: {
    position: "absolute",
    top: 8, // top-2
    left: 8, // left-2
    zIndex: 2,
  },
  badge: {
    paddingHorizontal: 8, // px-2
    paddingVertical: 2, // py-0.5
  },
  badgeHome: {
    borderRadius: 9999, // rounded-full
  },
  badgeShop: {
    borderRadius: 2, // rounded-sm
  },
  badgeText: {
    color: "white",
    fontFamily: fontFamily.interBold,
  },
  badgeTextHome: {
    fontSize: fontSize[9], // text-[9px]
  },
  badgeTextShop: {
    fontSize: fontSize[10], // text-[10px]
  },
  originalBadge: {
    position: "absolute",
    bottom: 8, // bottom-2
    right: 8, // right-2
    borderRadius: 2, // rounded-sm
    zIndex: 2,
  },
  originalBadgeHome: {
    backgroundColor: "rgba(15, 23, 42, 0.8)", // bg-slate-900/80
    paddingHorizontal: 6, // px-1.5
    paddingVertical: 2, // py-0.5
  },
  originalBadgeShop: {
    backgroundColor: "#0F172A", // bg-slate-900
    paddingHorizontal: 8, // px-2
    paddingVertical: 2, // py-0.5
  },
  originalStrike: {
    fontFamily: fontFamily.interRegular,
    color: "white",
    textDecorationLine: "line-through", // line-through
  },
  originalStrikeHome: {
    fontSize: fontSize[9], // text-[9px]
  },
  originalStrikeShop: {
    fontSize: fontSize[10], // text-[10px]
  },
  bottomLeftBadge: {
    position: "absolute",
    bottom: 8,
    left: 8,
    zIndex: 2,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 4,
  },
  ratingText: {
    fontFamily: fontFamily.interSemiBold,
    fontSize: fontSize[10],
  },
  soldOut: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(15, 23, 42, 0.55)", // bg-slate-900/55
    alignItems: "center",
    justifyContent: "center",
    zIndex: 3,
  },
  soldOutText: {
    fontFamily: fontFamily.interSemiBold,
    color: "white",
    fontSize: fontSize[13],
  },
  footer: {
    alignItems: "flex-start",
  },
  footerHome: {
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 6,
    height: 68, // Tightened further to minimize bottom gap, adjusted for larger font
  },
  footerShop: {
    paddingHorizontal: 8, // px-2
    paddingTop: 6, // pt-1.5
    paddingBottom: 8, // pb-2
    height: 84, // Fixes card height
  },
  type: {
    fontFamily: fontFamily.interRegular,
    color: "#9CA3AF", // text-gray-400
    textTransform: "uppercase",
    fontSize: fontSize[10], // text-[10px]
    letterSpacing: 0.5, // tracking-wide approx
    marginBottom: 2, // mb-0.5
  },
  title: {
    fontFamily: fontFamily.interMedium,
    lineHeight: 16, // leading-tight approx
    marginBottom: 4, // mb-1
  },
  titleHome: {
    fontSize: fontSize[13], // text-[13px]
    marginBottom: 2, // Tighter spacing for home cards
  },
  titleShop: {
    fontSize: fontSize[13], // text-[13px]
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
  },
})
