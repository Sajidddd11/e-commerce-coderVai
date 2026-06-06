import { useEffect, useState } from "react"
import {
  View,
  ScrollView,
  Pressable,
  StyleSheet,
  Alert,
  useWindowDimensions,
} from "react-native"
import { Image } from "expo-image"
import { useLocalSearchParams, useRouter } from "expo-router"
import { ChevronLeft } from "lucide-react-native"
import { HttpTypes } from "@medusajs/types"
import { Screen } from "@components/layout/Screen"
import { ThemedText } from "@components/ui/ThemedText"
import { Button } from "@components/ui/Button"
import { Skeleton } from "@components/ui/Skeleton"
import { ProductPrice } from "@components/product/ProductPrice"
import { ProductReviews } from "@components/product/ProductReviews"
import { ProductRail } from "@components/product/ProductRail"
import { SectionHeader } from "@components/home/SectionHeader"
import { useRegionStore } from "@stores/region-store"
import { useCartStore } from "@stores/cart-store"
import { getProductByHandle, listProducts } from "@api/products"
import { getProductPrice } from "@utils/get-product-price"
import { trackViewContent, trackAddToCart } from "@utils/facebook-analytics"
import { colors, spacing, borderRadius } from "@design/theme"

export default function ProductScreen() {
  const { handle } = useLocalSearchParams<{ handle: string }>()
  const router = useRouter()
  const { width } = useWindowDimensions()

  const region = useRegionStore((s) => s.region)
  const countryCode = useRegionStore((s) => s.countryCode)
  const add = useCartStore((s) => s.add)
  const isMutating = useCartStore((s) => s.isMutating)

  const [product, setProduct] = useState<HttpTypes.StoreProduct | null>(null)
  const [related, setRelated] = useState<HttpTypes.StoreProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [variantId, setVariantId] = useState<string | null>(null)

  useEffect(() => {
    if (!region?.id || !handle) return
    setLoading(true)
    setRelated([])
    getProductByHandle(handle, region.id)
      .then((p) => {
        setProduct(p)
        if (p?.variants?.length === 1) setVariantId(p.variants[0].id)
        if (p) {
          const { cheapestPrice } = getProductPrice({ product: p })
          trackViewContent({
            contentId: p.id,
            contentName: p.title,
            value: cheapestPrice?.calculated_price_number,
            currency: cheapestPrice?.currency_code,
          })
          loadRelated(p)
        }
      })
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handle, region?.id])

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
      Alert.alert("Select an option", "Please choose a variant first.")
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
      Alert.alert("Select an option", "Please choose a variant first.")
      return
    }
    try {
      await addChosen(chosen)
      router.push("/checkout")
    } catch {
      Alert.alert("Error", "Could not start checkout. Please try again.")
    }
  }

  const images = product?.images?.length
    ? product.images
    : product?.thumbnail
    ? [{ url: product.thumbnail } as any]
    : []

  return (
    <Screen edges={["top"]}>
      <Pressable style={styles.backBtn} onPress={() => router.back()}>
        <ChevronLeft size={24} color={colors.grey[90]} />
      </Pressable>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {loading ? (
          <Skeleton width={width} height={width} radius={0} />
        ) : (
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
          >
            {images.map((img, i) => (
              <Image
                key={i}
                source={img.url}
                style={{ width, height: width }}
                contentFit="cover"
              />
            ))}
          </ScrollView>
        )}

        <View style={styles.body}>
          {loading ? (
            <>
              <Skeleton width="70%" height={22} />
              <Skeleton width="40%" height={18} />
            </>
          ) : product ? (
            <>
              <ThemedText variant="sectionHeading" color={colors.grey[90]}>
                {product.title}
              </ThemedText>

              <ProductPrice
                product={product}
                variantId={variantId ?? undefined}
                size="lg"
              />

              {(product.variants?.length ?? 0) > 1 ? (
                <View style={styles.variants}>
                  <ThemedText variant="subheading" color={colors.grey[80]}>
                    Options
                  </ThemedText>
                  <View style={styles.variantRow}>
                    {product.variants?.map((v) => {
                      const active = variantId === v.id
                      return (
                        <Pressable
                          key={v.id}
                          onPress={() => setVariantId(v.id)}
                          style={[
                            styles.variantChip,
                            {
                              borderColor: active
                                ? colors.slate[900]
                                : colors.grey[20],
                              backgroundColor: active
                                ? colors.slate[900]
                                : colors.grey[0],
                            },
                          ]}
                        >
                          <ThemedText
                            variant="bodySmall"
                            color={active ? colors.grey[0] : colors.grey[80]}
                          >
                            {v.title}
                          </ThemedText>
                        </Pressable>
                      )
                    })}
                  </View>
                </View>
              ) : null}

              {product.description ? (
                <View style={styles.description}>
                  <ThemedText variant="subheading" color={colors.grey[80]}>
                    Description
                  </ThemedText>
                  <ThemedText variant="body" color={colors.grey[60]}>
                    {product.description}
                  </ThemedText>
                </View>
              ) : null}

              <ProductReviews productId={product.id} />
            </>
          ) : (
            <ThemedText variant="body" color={colors.grey[50]}>
              Product not found.
            </ThemedText>
          )}
        </View>

        {related.length > 0 ? (
          <View style={styles.related}>
            <SectionHeader title="You may also like" />
            <ProductRail products={related} />
          </View>
        ) : null}
      </ScrollView>

      {product && !loading ? (
        <View style={styles.addBar}>
          <Button
            title="Buy Now"
            variant="secondary"
            loading={isMutating}
            onPress={onBuyNow}
            style={styles.addBarBtn}
          />
          <Button
            title="Add to Cart"
            loading={isMutating}
            onPress={onAdd}
            style={styles.addBarBtn}
          />
        </View>
      ) : null}
    </Screen>
  )
}

const styles = StyleSheet.create({
  backBtn: {
    position: "absolute",
    top: spacing.sm,
    left: spacing.base,
    zIndex: 10,
    backgroundColor: colors.grey[0],
    borderRadius: borderRadius.circle,
    padding: spacing.xs,
  },
  scroll: {
    paddingBottom: spacing["4xl"],
  },
  body: {
    padding: spacing.base,
    gap: spacing.md,
  },
  variants: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  variantRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  variantChip: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.base,
    borderWidth: 1,
  },
  description: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  related: {
    marginTop: spacing.base,
  },
  addBar: {
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.base,
    borderTopWidth: 1,
    borderTopColor: colors.grey[20],
    backgroundColor: colors.grey[0],
  },
  addBarBtn: {
    flex: 1,
  },
})

