import { useEffect, useState } from "react"
import {
  View,
  ScrollView,
  Pressable,
  StyleSheet,
  Alert,
  useWindowDimensions,
  Text,
  Linking,
  Share,
} from "react-native"
import { Image } from "expo-image"
import { useLocalSearchParams, useRouter } from "expo-router"
import { ChevronLeft, ShoppingCart, ChevronRight, MessageCircle, Star, Share as ShareIcon } from "lucide-react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { HttpTypes } from "@medusajs/types"
import Markdown from "react-native-markdown-display"
import { Screen } from "@components/layout/Screen"
import { Skeleton } from "@components/ui/Skeleton"
import { ProductPrice } from "@components/product/ProductPrice"
import { ProductReviews } from "@components/product/ProductReviews"
import { ProductRail } from "@components/product/ProductRail"
import { useRegionStore } from "@stores/region-store"
import { useCartStore } from "@stores/cart-store"
import { getProductByHandle, listProducts } from "@api/products"
import { getProductReviews } from "@api/enhancements"
import { getProductPrice } from "@utils/get-product-price"
import { trackViewContent, trackAddToCart } from "@utils/facebook-analytics"
import { colors } from "@design/theme"
import { fontFamily, fontSize } from "@design/typography"

const COLOR_MAP: Record<string, string> = {
  black: "#000000",
  white: "#FFFFFF",
  red: "#EF4444",
  blue: "#3B82F6",
  green: "#10B981",
  teal: "#56AEBF",
  navy: "#1E3A5F",
  gray: "#6B7280",
  grey: "#6B7280",
  yellow: "#EAB308",
  orange: "#F97316",
  purple: "#A855F7",
  pink: "#EC4899",
  cyan: "#06B6D4",
}

export default function ProductScreen() {
  const { handle } = useLocalSearchParams<{ handle: string }>()
  const router = useRouter()
  const { width } = useWindowDimensions()
  const insets = useSafeAreaInsets()

  const region = useRegionStore((s) => s.region)
  const countryCode = useRegionStore((s) => s.countryCode)
  const add = useCartStore((s) => s.add)
  const clearCart = useCartStore((s) => s.clear)
  const isMutating = useCartStore((s) => s.isMutating)

  const [product, setProduct] = useState<HttpTypes.StoreProduct | null>(null)
  const [related, setRelated] = useState<HttpTypes.StoreProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [variantId, setVariantId] = useState<string | null>(null)
  const [options, setOptions] = useState<Record<string, string>>({})
  const [rating, setRating] = useState<number | null>(null)
  const [reviewCount, setReviewCount] = useState<number>(0)

  useEffect(() => {
    if (!region?.id || !handle) return
    setLoading(true)
    setRelated([])
    getProductByHandle(handle, region.id)
      .then((p) => {
        setProduct(p)
        if (p?.variants?.length === 1) {
          setVariantId(p.variants[0].id)
        }
        if (p) {
          const { cheapestPrice } = getProductPrice({ product: p })
          trackViewContent({
            contentId: p.id,
            contentName: p.title,
            value: cheapestPrice?.calculated_price_number,
            currency: cheapestPrice?.currency_code,
          })
          loadRelated(p)
          getProductReviews(p.id).then((res) => {
            setRating(res.average)
            setReviewCount(res.count)
          }).catch(() => {})
        }
      })
      .finally(() => setLoading(false))
  }, [handle, region?.id])

  // Initialize options from the first available variant if not set
  useEffect(() => {
    if (product?.variants?.[0]?.options && Object.keys(options).length === 0) {
      const initial: Record<string, string> = {}
      product.variants[0].options.forEach((opt: any) => {
        initial[opt.option_id] = opt.value
      })
      setOptions(initial)
    }
  }, [product])

  // Update variantId when options change
  useEffect(() => {
    if (!product?.variants?.length) return
    const match = product.variants.find((v) => {
      if (!v.options) return false
      return v.options.every((opt: any) => options[opt.option_id] === opt.value)
    })
    setVariantId(match?.id ?? null)
  }, [options, product])

  const loadRelated = async (p: HttpTypes.StoreProduct) => {
    const categoryId = p.categories?.[0]?.id
    const collectionId = p.collection_id
    const queryParams: any = { limit: 10 }
    if (categoryId) queryParams.category_id = [categoryId]
    else if (collectionId) queryParams.collection_id = [collectionId]
    else return

    try {
      const res = await listProducts({ countryCode, queryParams })
      setRelated(res.response.products.filter((rp) => rp.id !== p.id).slice(0, 8))
    } catch {
      // ignore
    }
  }

  const addChosen = async (chosen: string) => {
    await add(chosen, 1, countryCode)
    if (!product) return
    const { cheapestPrice, variantPrice } = getProductPrice({
      product,
      variantId: chosen,
    })
    const price = variantPrice ?? cheapestPrice
    trackAddToCart({
      contentId: product.id,
      contentName: product.title,
      value: price?.calculated_price_number,
      currency: price?.currency_code,
    })
  }

  const resolveVariant = (): string | null => {
    const variants = product?.variants ?? []
    return variantId || (variants.length === 1 ? variants[0].id : null)
  }

  const onAdd = async () => {
    if (!product) return
    const chosen = resolveVariant()
    if (!chosen) {
      Alert.alert("Select options", "Please choose your preferred options first.")
      return
    }
    try {
      await addChosen(chosen)
      Alert.alert("Added to cart", `${product.title} was added to your cart.`, [
        { text: "Keep shopping" },
        { text: "View cart", onPress: () => router.push("/(tabs)/cart") },
      ])
    } catch {
      Alert.alert("Error", "Could not add to cart. Please try again.")
    }
  }

  const onBuyNow = async () => {
    if (!product) return
    const chosen = resolveVariant()
    if (!chosen) {
      Alert.alert("Select options", "Please choose your preferred options first.")
      return
    }
    try {
      await clearCart()
      await addChosen(chosen)
      router.push("/checkout")
    } catch {
      Alert.alert("Error", "Could not process your request. Please try again.")
    }
  }

  const onChat = () => {
    if (!product) return
    const chosen = resolveVariant()
    const variant = product.variants?.find((v) => v.id === chosen)
    const variantText = variant?.title && variant.title !== "Default Title" ? ` - Variant: ${variant.title}` : ""
    const storeUrl = process.env.EXPO_PUBLIC_STOREFRONT_URL || "https://codervai.com"
    const productUrl = chosen ? `${storeUrl}/products/${product.handle}?v_id=${chosen}` : `${storeUrl}/products/${product.handle}`
    const message = `Hi, I'm interested in this product: ${product.title}${variantText}.\n${productUrl}`
    const phone = process.env.EXPO_PUBLIC_WHATSAPP_NUMBER || ""
    const url = `whatsapp://send?phone=${phone}&text=${encodeURIComponent(message)}`
    Linking.openURL(url).catch(() => {
      Alert.alert("Error", "Make sure WhatsApp is installed on your device")
    })
  }

  const onShare = async () => {
    if (!product) return
    try {
      const chosen = resolveVariant()
      const storeUrl = process.env.EXPO_PUBLIC_STOREFRONT_URL || "https://codervai.com"
      const url = chosen ? `${storeUrl}/products/${product.handle}?v_id=${chosen}` : `${storeUrl}/products/${product.handle}`
      await Share.share({
        message: `Check out ${product.title}!\n${url}`,
        url: url,
        title: product.title,
      })
    } catch (error) {
      console.log("Error sharing:", error)
    }
  }

  const images = product?.images?.length
    ? product.images
    : product?.thumbnail
    ? [{ url: product.thumbnail } as any]
    : []

  // Ensure square-ish images like uidemo: h-80.5 (approx 322px)
  const imageHeight = 322

  const renderOptions = () => {
    if (product?.variants?.length === 1) {
      return null
    }

    if (!product?.options?.length) {
      if ((product?.variants?.length ?? 0) > 1) {
        return (
          <View style={styles.variants}>
            <Text style={styles.variantsTitle}>Options</Text>
            <View style={styles.variantRow}>
              {product?.variants?.map((v) => {
                const active = variantId === v.id
                return (
                  <Pressable
                    key={v.id}
                    onPress={() => setVariantId(v.id)}
                    style={[
                      styles.variantChip,
                      active ? styles.variantChipActive : styles.variantChipInactive
                    ]}
                  >
                    <Text
                      style={[
                        styles.variantText,
                        active ? styles.variantTextActive : styles.variantTextInactive
                      ]}
                    >
                      {v.title}
                    </Text>
                  </Pressable>
                )
              })}
            </View>
          </View>
        )
      }
      return null
    }

    return (
      <View style={styles.variants}>
        {product.options.map((opt: any) => {
          const isColor = opt.title.toLowerCase() === "color"
          const uniqueValues = Array.from(new Set(opt.values?.map((v: any) => v.value) as string[]))

          return (
            <View key={opt.id} style={styles.optionGroup}>
              <Text style={styles.variantsTitle}>{opt.title}</Text>
              <View style={isColor ? styles.colorRow : styles.variantRow}>
                {uniqueValues.map((val) => {
                  const active = options[opt.id] === val
                  if (isColor) {
                    let colorHex = COLOR_MAP[val.toLowerCase()]
                    if (!colorHex) {
                      // Attempt to use the string as a valid color, or fallback to gray
                      colorHex = val.toLowerCase()
                    }
                    return (
                      <Pressable
                        key={val}
                        onPress={() => setOptions({ ...options, [opt.id]: val })}
                        style={[styles.colorChipWrap, active && styles.colorChipWrapActive]}
                      >
                        <View style={[styles.colorChip, { backgroundColor: colorHex }]} />
                      </Pressable>
                    )
                  }
                  return (
                    <Pressable
                      key={val}
                      onPress={() => setOptions({ ...options, [opt.id]: val })}
                      style={[
                        styles.variantChip,
                        active ? styles.variantChipActive : styles.variantChipInactive
                      ]}
                    >
                      <Text
                        style={[
                          styles.variantText,
                          active ? styles.variantTextActive : styles.variantTextInactive
                        ]}
                      >
                        {val}
                      </Text>
                    </Pressable>
                  )
                })}
              </View>
            </View>
          )
        })}
      </View>
    )
  }

  return (
    <Screen edges={["top"]} style={{ backgroundColor: "white" }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <View style={{ backgroundColor: colors.grey[10] }}>
          {loading ? (
            <Skeleton width={width} height={imageHeight} radius={0} />
          ) : (
            <View style={{ height: imageHeight }}>
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
              >
                {images.map((img, i) => (
                  <Image
                    key={i}
                    source={img.url}
                    style={{ width, height: imageHeight }}
                    contentFit="cover"
                  />
                ))}
              </ScrollView>
              <View style={styles.imageOverlay} />
            </View>
          )}

          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <ChevronLeft size={20} color={colors.slate[900]} />
          </Pressable>

          {product && !loading && (
            <Pressable style={styles.shareBtn} onPress={onShare}>
              <ShareIcon size={20} color={colors.slate[900]} />
            </Pressable>
          )}
        </View>

        <View style={styles.body}>
          {loading ? (
            <>
              <Skeleton width="70%" height={22} />
              <Skeleton width="40%" height={18} />
            </>
          ) : product ? (
            <>
              <View style={styles.titleArea}>
                <Text style={styles.titleText}>
                  {product.title}
                </Text>

                <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 }}>
                  <View style={{ flexDirection: "row", gap: 2 }}>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        size={14}
                        color="#EAB308"
                        fill={i <= Math.round(rating || 0) ? "#EAB308" : "transparent"}
                      />
                    ))}
                  </View>
                  <Text style={{ fontFamily: fontFamily.interMedium, fontSize: fontSize.sm, color: "#6B7280" }}>
                    ({reviewCount})
                  </Text>
                </View>
                
                <View style={styles.priceRow}>
                  <ProductPrice
                    product={product}
                    variantId={variantId ?? undefined}
                    size="lg"
                    color={colors.brand.teal}
                  />
                </View>
              </View>

              {product.subtitle ? (
                <Markdown style={markdownStyles}>
                  {product.subtitle.trim()}
                </Markdown>
              ) : null}

              {renderOptions()}

              <View style={{ height: 16 }} />

              {product.description ? (
                <Markdown style={markdownStyles}>
                  {product.description.trim()}
                </Markdown>
              ) : null}

              <ProductReviews productId={product.id} />
            </>
          ) : (
            <Text style={{ color: colors.grey[50] }}>
              Product not found.
            </Text>
          )}

          {related.length > 0 ? (
            <View style={styles.related}>
              <View style={styles.relatedHeader}>
                <Text style={styles.relatedTitle}>You may also like</Text>
                <Pressable style={styles.seeAllBtn}>
                  <Text style={styles.seeAllText}>See all</Text>
                  <ChevronRight size={16} color={colors.brand.teal} />
                </Pressable>
              </View>
              <ProductRail products={related} />
            </View>
          ) : null}
        </View>
      </ScrollView>

      {product && !loading ? (
        <View style={[styles.addBar, { paddingBottom: Math.max(12, insets.bottom + 8) }]}>
          <Pressable
            style={styles.chatBtn}
            onPress={onChat}
          >
            <MessageCircle size={20} color={colors.brand.teal} />
            <Text style={{ fontFamily: fontFamily.interSemiBold, fontSize: fontSize.sm, color: colors.brand.teal }}>
              Ask
            </Text>
          </Pressable>

          <Pressable
            style={[styles.addBtn, isMutating && { opacity: 0.7 }]}
            disabled={isMutating}
            onPress={onAdd}
          >
            <ShoppingCart size={20} color={colors.brand.teal} />
            <Text style={styles.addBtnText}>
              {isMutating ? "Adding..." : "Add to Cart"}
            </Text>
          </Pressable>

          <Pressable
            style={[styles.buyNowBtn, isMutating && { opacity: 0.7 }]}
            disabled={isMutating}
            onPress={onBuyNow}
          >
            <Text style={styles.buyNowText}>
              {isMutating ? "Processing..." : "Buy Now"}
            </Text>
          </Pressable>
        </View>
      ) : null}
    </Screen>
  )
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: 140, // pb-35
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.01)", // bg-black/1 from demo
  },
  backBtn: {
    position: "absolute",
    top: 16, // top-4
    left: 16, // left-4
    width: 44, // w-11
    height: 44, // h-11
    borderRadius: 22, // rounded-full
    backgroundColor: "rgba(255, 255, 255, 0.8)", // bg-white/80
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  shareBtn: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  body: {
    paddingHorizontal: 16, // px-4
    paddingTop: 16, // pt-4
    gap: 16, // gap-4
    backgroundColor: "white",
  },
  titleArea: {
    gap: 4, // gap-1
  },
  titleText: {
    fontFamily: fontFamily.interSemiBold,
    fontSize: fontSize["2xl"], // text-2xl
    lineHeight: 28, // leading-tight
    letterSpacing: -0.5, // tracking-tight
    color: "#111827", // text-gray-900
  },
  priceRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    marginTop: 4, // mt-1
    gap: 8, // gap-2
  },
  description: {
    fontFamily: fontFamily.interRegular,
    fontSize: fontSize.sm, // text-sm
    lineHeight: 24, // leading-relaxed
    color: "#6B7280", // text-gray-500
  },
  variants: {
    gap: 12, // slightly larger gap between option groups
  },
  optionGroup: {
    gap: 8, // gap-2
  },
  variantsTitle: {
    fontFamily: fontFamily.interSemiBold,
    fontSize: fontSize.sm, // text-sm
    color: "#111827", // text-gray-900
  },
  variantRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8, // gap-2
  },
  colorRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12, // gap-3
  },
  variantChip: {
    paddingHorizontal: 16, // px-4
    paddingVertical: 6, // py-1.5
    borderRadius: 9999, // rounded-full
    borderWidth: 1,
  },
  variantChipInactive: {
    backgroundColor: "white",
    borderColor: "#E5E7EB", // border-gray-200
  },
  variantChipActive: {
    backgroundColor: "#0F172A", // bg-slate-900
    borderColor: "#0F172A",
  },
  variantText: {
    fontFamily: fontFamily.interMedium,
    fontSize: fontSize.sm, // text-sm
  },
  variantTextInactive: {
    color: "#374151", // text-gray-700
  },
  variantTextActive: {
    color: "white",
  },
  colorChipWrap: {
    width: 38, // ring offset
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  colorChipWrapActive: {
    borderWidth: 2,
    borderColor: "#56AEBF",
  },
  colorChip: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)", // subtle border for white color chips
  },
  related: {
    gap: 12, // gap-3
  },
  relatedHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  relatedTitle: {
    fontFamily: fontFamily.interSemiBold,
    fontSize: fontSize.lg, // text-lg
    color: "#111827", // text-gray-900
  },
  seeAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4, // gap-1
  },
  seeAllText: {
    fontFamily: fontFamily.interMedium,
    fontSize: fontSize.sm, // text-sm
    color: "#56AEBF", // text-[#56AEBF]
  },
  addBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB", // border-gray-200
    paddingHorizontal: 16, // px-4
    paddingVertical: 8, // py-2
    flexDirection: "row",
    gap: 8,
  },
  chatBtn: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#56AEBF",
    borderRadius: 8, // rounded-lg
    height: 48, // h-12
    paddingHorizontal: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  addBtn: {
    flex: 1,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#56AEBF",
    borderRadius: 8, // rounded-lg
    height: 48, // h-12
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8, // gap-2
  },
  addBtnText: {
    fontFamily: fontFamily.interSemiBold,
    fontSize: fontSize.sm, // text-sm
    color: "#56AEBF",
  },
  buyNowBtn: {
    flex: 1,
    backgroundColor: "#56AEBF",
    borderRadius: 8,
    height: 48,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  buyNowText: {
    fontFamily: fontFamily.interSemiBold,
    fontSize: fontSize.sm,
    color: "white",
  },
})

const markdownStyles = StyleSheet.create({
  body: {
    fontFamily: fontFamily.interRegular,
    fontSize: fontSize.sm,
    lineHeight: 24,
    color: "#4B5563", // text-gray-600
  },
  heading1: {
    fontFamily: fontFamily.interSemiBold,
    fontSize: fontSize.xl,
    color: "#111827",
    marginTop: 16,
    marginBottom: 8,
  },
  heading2: {
    fontFamily: fontFamily.interSemiBold,
    fontSize: fontSize.lg,
    color: "#111827",
    marginTop: 16,
    marginBottom: 8,
  },
  heading3: {
    fontFamily: fontFamily.interSemiBold,
    fontSize: fontSize.md,
    color: "#111827",
    marginTop: 16,
    marginBottom: 8,
  },
  paragraph: {
    marginTop: 8,
    marginBottom: 8,
  },
  list_item: {
    marginTop: 4,
    marginBottom: 4,
  },
})

