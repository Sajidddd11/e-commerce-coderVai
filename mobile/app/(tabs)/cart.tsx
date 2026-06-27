import { useEffect, useState } from "react"
import { View, ScrollView, Pressable, StyleSheet, Text, TextInput, ActivityIndicator } from "react-native"
import { Image } from "expo-image"
import { useRouter } from "expo-router"
import { Minus, Plus, Trash2, ShoppingBag, X } from "lucide-react-native"
import { HttpTypes } from "@medusajs/types"
import { Screen } from "@components/layout/Screen"
import { useCartStore } from "@stores/cart-store"
import { getFreeShippingThreshold, FreeShippingInfo } from "@api/enhancements"
import { convertToLocale } from "@utils/money"
import { colors, spacing, borderRadius } from "@design/theme"

function currencyOf(cart: HttpTypes.StoreCart | null) {
  return cart?.currency_code || cart?.region?.currency_code || "bdt"
}

export default function CartScreen() {
  const router = useRouter()
  const cart = useCartStore((s) => s.cart)
  const isLoading = useCartStore((s) => s.isLoading)
  const isMutating = useCartStore((s) => s.isMutating)
  const refresh = useCartStore((s) => s.refresh)
  const update = useCartStore((s) => s.update)
  const remove = useCartStore((s) => s.remove)
  const applyPromo = useCartStore((s) => s.applyPromo)

  const [promoInput, setPromoInput] = useState("")
  const [promoError, setPromoError] = useState<string | null>(null)
  const [promoLoading, setPromoLoading] = useState(false)
  const [freeShipping, setFreeShipping] = useState<FreeShippingInfo | null>(null)
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null)

  const handleUpdate = async (itemId: string, newQty: number) => {
    setUpdatingItemId(itemId)
    try {
      await update(itemId, newQty)
    } finally {
      setUpdatingItemId(null)
    }
  }

  const handleRemove = async (itemId: string) => {
    setUpdatingItemId(itemId)
    try {
      await remove(itemId)
    } finally {
      setUpdatingItemId(null)
    }
  }

  useEffect(() => {
    refresh()
  }, [refresh])

  useEffect(() => {
    getFreeShippingThreshold().then(setFreeShipping)
  }, [])

  const items = cart?.items ?? []
  const currency_code = currencyOf(cart)
  const subtotalAmount = cart?.item_subtotal ?? cart?.subtotal ?? 0
  const freeShippingActive =
    !!freeShipping && freeShipping.enabled !== false && freeShipping.threshold > 0
  const remainingForFree = freeShippingActive
    ? freeShipping!.threshold - subtotalAmount
    : 0
  const appliedPromos = (cart?.promotions ?? []).filter((p) => p.code)
  const visiblePromos = appliedPromos.filter((p) => p.code && !p.code.startsWith("LOYALTY-"))

  const onApplyPromo = async () => {
    const code = promoInput.trim()
    if (!code) return
    setPromoError(null)
    setPromoLoading(true)
    try {
      const existing = appliedPromos.map((p) => p.code as string)
      await applyPromo([...existing, code])
      const updated = useCartStore.getState().cart
      const added = (updated?.promotions ?? []).some(
        (p) => p.code?.toLowerCase() === code.toLowerCase()
      )
      if (!added) {
        setPromoError("That code is invalid or expired.")
      } else {
        setPromoInput("")
      }
    } catch {
      setPromoError("Could not apply code. Please try again.")
    } finally {
      setPromoLoading(false)
    }
  }

  const onRemovePromo = async (code: string) => {
    const remaining = appliedPromos
      .map((p) => p.code as string)
      .filter((c) => c.toLowerCase() !== code.toLowerCase())
    await applyPromo(remaining)
  }

  if (!isLoading && items.length === 0) {
    return (
      <Screen>
        <View style={styles.empty}>
          <Text style={styles.headerText}>Your cart is empty</Text>
          <Text style={{ color: colors.grey[50], marginTop: 8 }}>
            Browse products and add your favourites.
          </Text>
          <Pressable
            style={({ pressed }) => [
              styles.checkoutBtn,
              { marginTop: 24 },
              pressed && { opacity: 0.8 },
            ]}
            onPress={() => router.push("/(tabs)/shop")}
          >
            <Text style={styles.checkoutBtnText}>Browse Products</Text>
          </Pressable>
        </View>
      </Screen>
    )
  }

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.headerText}>Shopping Cart</Text>
      </View>

      {freeShippingActive ? (
        <View style={styles.freeShip}>
          <ShoppingBag size={20} color={colors.brand.teal} />
          <Text style={styles.freeShipText}>
            {remainingForFree > 0
              ? `Add ${convertToLocale({
                  amount: remainingForFree,
                  currency_code,
                })} more for free shipping!`
              : "You've unlocked free shipping!"}
          </Text>
        </View>
      ) : null}

      <ScrollView contentContainerStyle={styles.list}>
        <View style={styles.itemsContainer}>
          {items
            .sort((a, b) =>
              (a.created_at ?? "") > (b.created_at ?? "") ? 1 : -1
            )
            .map((item, index) => (
              <View key={item.id} style={[styles.item, index === items.length - 1 && { borderBottomWidth: 0 }]}>
                <View style={styles.thumbWrap}>
                  <Image
                    source={item.thumbnail}
                    style={styles.thumb}
                    contentFit="cover"
                  />
                </View>
                <View style={styles.itemBody}>
                  <Text style={styles.itemTitle} numberOfLines={2}>
                    {item.product_title || item.title}
                  </Text>
                  {item.variant_title ? (
                    <Text style={styles.itemVariant}>
                      {item.variant_title}
                    </Text>
                  ) : null}

                  <View style={styles.stepper}>
                    <Pressable
                      disabled={isMutating || !!updatingItemId}
                      onPress={() =>
                        item.quantity > 1
                          ? handleUpdate(item.id, item.quantity - 1)
                          : handleRemove(item.id)
                      }
                      style={({ pressed }) => [
                        styles.stepBtn,
                        pressed && { opacity: 0.6 },
                      ]}
                    >
                      <Minus size={12} color={colors.brand.teal} />
                    </Pressable>
                    {updatingItemId === item.id ? (
                      <ActivityIndicator size="small" color={colors.brand.teal} style={{ width: 20 }} />
                    ) : (
                      <Text style={styles.stepCount}>
                        {item.quantity}
                      </Text>
                    )}
                    <Pressable
                      disabled={isMutating || !!updatingItemId}
                      onPress={() => handleUpdate(item.id, item.quantity + 1)}
                      style={({ pressed }) => [
                        styles.stepBtn,
                        pressed && { opacity: 0.6 },
                      ]}
                    >
                      <Plus size={12} color={colors.brand.teal} />
                    </Pressable>
                  </View>
                  
                  <View style={styles.itemFooter}>
                    <Text style={styles.itemPrice}>
                      {convertToLocale({
                        amount: item.total ?? 0,
                        currency_code,
                      })}
                    </Text>
                    <Pressable
                      disabled={isMutating || !!updatingItemId}
                      onPress={() => handleRemove(item.id)}
                      style={({ pressed }) => [
                        styles.removeBtn,
                        pressed && { opacity: 0.6 },
                      ]}
                    >
                      {updatingItemId === item.id ? (
                        <ActivityIndicator size="small" color={colors.error} />
                      ) : (
                        <Trash2 size={16} color={colors.error} />
                      )}
                    </Pressable>
                  </View>
                </View>
              </View>
            ))}
        </View>

        <View style={styles.promoBlock}>
          <Text style={styles.promoTitle}>Promo Code</Text>
          <View style={styles.promoRow}>
            <TextInput
              style={styles.promoInput}
              placeholder="Enter code"
              autoCapitalize="characters"
              value={promoInput}
              onChangeText={setPromoInput}
            />
            <Pressable
              style={({ pressed }) => [
                styles.promoBtn,
                pressed && { opacity: 0.8 },
              ]}
              onPress={onApplyPromo}
              disabled={promoLoading}
            >
              {promoLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.promoBtnText}>Apply</Text>
              )}
            </Pressable>
          </View>
          {promoError && <Text style={styles.promoError}>{promoError}</Text>}
          {visiblePromos.length > 0 ? (
            <View style={styles.promoChips}>
              {visiblePromos.map((p) => (
                <View key={p.id} style={styles.promoChip}>
                  <Text style={styles.promoChipText}>
                    {p.code}
                  </Text>
                  <Pressable
                    onPress={() => onRemovePromo(p.code as string)}
                    hitSlop={6}
                    style={({ pressed }) => [pressed && { opacity: 0.5 }]}
                  >
                    <X size={12} color={colors.brand.teal} />
                  </Pressable>
                </View>
              ))}
            </View>
          ) : null}
        </View>

        <View style={styles.summary}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>
              {convertToLocale({
                amount: cart?.item_subtotal ?? cart?.subtotal ?? 0,
                currency_code,
              })}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Shipping</Text>
            <Text style={styles.summaryValue}>
              {convertToLocale({
                amount: cart?.shipping_total ?? 0,
                currency_code,
              })}
            </Text>
          </View>
          {cart?.discount_total ? (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Discount</Text>
              <Text style={[styles.summaryValue, { color: colors.error }]}>
                -{convertToLocale({
                  amount: cart.discount_total,
                  currency_code,
                })}
              </Text>
            </View>
          ) : null}
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>
              {convertToLocale({ amount: cart?.total ?? 0, currency_code })}
            </Text>
          </View>
        </View>
        <View style={{ height: 16 }} />
      </ScrollView>

      <View style={styles.checkoutContainer}>
        <Pressable
          style={({ pressed }) => [
            styles.checkoutBtn,
            (isMutating || !!updatingItemId) && { backgroundColor: colors.grey[40] },
            pressed && { opacity: 0.8 },
          ]}
          disabled={isMutating || !!updatingItemId}
          onPress={() => router.push("/checkout")}
        >
          <Text style={styles.checkoutBtnText}>Proceed to Checkout</Text>
        </Pressable>
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: 4, // reduced
    paddingBottom: 8, // reduced
    borderBottomWidth: 1,
    borderBottomColor: colors.grey[20],
  },
  headerText: {
    fontSize: 24, // text-2xl
    fontWeight: "600", // font-semibold
    color: colors.slate[900], // text-gray-900
    letterSpacing: -0.5, // tracking-tight
  },
  freeShip: {
    backgroundColor: "rgba(86, 174, 191, 0.1)", // bg-[#56aebf]/10
    paddingHorizontal: spacing.md,
    paddingVertical: 12, // py-3
    flexDirection: "row",
    alignItems: "center",
    gap: 12, // gap-3
  },
  freeShipText: {
    fontFamily: "Inter-Regular",
    fontSize: 14, // text-sm
    lineHeight: 20, // leading-5
    color: colors.brand.teal,
  },
  list: {
    flexGrow: 1,
  },
  itemsContainer: {
    paddingHorizontal: spacing.md,
    paddingTop: 16, // pt-4
    gap: 8, // gap-2
  },
  item: {
    flexDirection: "row",
    paddingBottom: 16, // pb-4
    gap: 12, // gap-3
    borderBottomWidth: 1,
    borderBottomColor: colors.grey[20],
  },
  thumbWrap: {
    width: 80, // w-20
    height: 80, // h-20
    borderRadius: 8, // rounded-lg
    backgroundColor: colors.grey[10], // bg-gray-100
    overflow: "hidden",
  },
  thumb: {
    width: "100%",
    height: "100%",
  },
  itemBody: {
    flex: 1,
    position: "relative",
    gap: 4, // gap-1
  },
  itemTitle: {
    fontFamily: "Inter-SemiBold",
    fontWeight: "600", // font-semibold
    fontSize: 14, // text-sm
    lineHeight: 20, // leading-5
    color: colors.slate[900], // text-gray-900
  },
  itemVariant: {
    fontFamily: "Inter-Regular",
    fontSize: 12, // text-xs
    lineHeight: 16, // leading-4
    color: colors.grey[50], // text-gray-500
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4, // mt-1
    gap: 8, // gap-2
  },
  stepBtn: {
    width: 32, // w-8
    height: 32, // h-8
    borderRadius: 16, // rounded-full
    borderWidth: 2,
    borderColor: colors.brand.teal,
    justifyContent: "center",
    alignItems: "center",
  },
  stepCount: {
    fontFamily: "Inter-SemiBold",
    fontWeight: "600",
    fontSize: 14, // text-sm
    lineHeight: 20, // leading-5
    color: colors.slate[900],
    textAlign: "center",
    width: 20, // w-5
  },
  itemFooter: {
    flexDirection: "row",
    marginTop: 4, // mt-1
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemPrice: {
    fontFamily: "Inter-SemiBold",
    fontWeight: "600",
    fontSize: 14, // text-sm
    lineHeight: 20, // leading-5
    color: colors.slate[900],
  },
  removeBtn: {
    position: "absolute",
    right: 0,
    bottom: 0,
  },
  promoBlock: {
    paddingHorizontal: spacing.md,
    paddingTop: 8, // pt-2
    paddingBottom: 16, // pb-4
    gap: 12, // gap-3
  },
  promoTitle: {
    fontFamily: "Inter-SemiBold",
    fontWeight: "600",
    fontSize: 14,
    lineHeight: 20,
    color: colors.slate[900],
  },
  promoRow: {
    flexDirection: "row",
    gap: 8, // gap-2
  },
  promoInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.grey[20],
    borderRadius: borderRadius.base,
    paddingHorizontal: 16,
    height: 48,
    fontSize: 14,
    color: colors.slate[900],
    fontFamily: "Inter-Regular",
    backgroundColor: colors.grey[10],
  },
  promoBtn: {
    backgroundColor: colors.brand.teal,
    borderRadius: borderRadius.base,
    paddingHorizontal: 20,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  promoBtnText: {
    color: "white",
    fontFamily: "Inter-SemiBold",
    fontWeight: "600",
    fontSize: 14,
  },
  promoError: {
    color: colors.error,
    fontSize: 12,
  },
  promoChips: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4, // gap-1
  },
  promoChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4, // gap-1
    backgroundColor: "rgba(86, 174, 191, 0.1)", // bg-[#56aebf]/10
    borderRadius: 9999,
    paddingHorizontal: 12, // px-3
    paddingVertical: 4, // py-1
  },
  promoChipText: {
    color: colors.brand.teal,
    fontFamily: "Inter-Regular",
    fontSize: 12,
    lineHeight: 16,
  },
  summary: {
    borderWidth: 1,
    borderColor: colors.grey[20],
    borderRadius: 8, // rounded-lg
    marginHorizontal: 16, // mx-4
    marginBottom: 16, // mb-4
    padding: 16, // p-4
    gap: 8, // gap-2
    backgroundColor: "white",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryLabel: {
    fontFamily: "Inter-Regular",
    color: colors.grey[50], // text-gray-500
    fontSize: 14,
    lineHeight: 20,
  },
  summaryValue: {
    fontFamily: "Inter-SemiBold",
    fontWeight: "600",
    color: colors.slate[900], // text-gray-900
    fontSize: 14,
    lineHeight: 20,
  },
  divider: {
    borderTopWidth: 1,
    borderTopColor: colors.grey[20],
    marginVertical: 4, // my-1
  },
  totalLabel: {
    fontSize: 16, // text-base
    fontWeight: "600",
    color: colors.slate[900],
  },
  totalValue: {
    fontSize: 18, // text-lg
    fontWeight: "600",
    color: colors.slate[900],
  },
  checkoutContainer: {
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: colors.grey[20],
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
  },
  checkoutBtn: {
    backgroundColor: colors.slate[900],
    borderRadius: 8, // rounded-lg
    paddingVertical: 16, // py-4
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  checkoutBtnText: {
    color: "white",
    fontFamily: "Inter-SemiBold",
    fontWeight: "600",
    fontSize: 14,
    lineHeight: 20,
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
})
