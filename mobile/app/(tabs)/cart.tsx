import { useEffect, useState } from "react"
import { View, ScrollView, Pressable, StyleSheet } from "react-native"
import { Image } from "expo-image"
import { useRouter } from "expo-router"
import { Minus, Plus, Trash2, Tag, X } from "lucide-react-native"
import { HttpTypes } from "@medusajs/types"
import { Screen } from "@components/layout/Screen"
import { ThemedText } from "@components/ui/ThemedText"
import { Button } from "@components/ui/Button"
import { Input } from "@components/ui/Input"
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
          <ThemedText variant="sectionHeading" color={colors.grey[80]}>
            Your cart is empty
          </ThemedText>
          <ThemedText variant="body" color={colors.grey[50]}>
            Browse products and add your favourites.
          </ThemedText>
          <Button
            title="Browse Products"
            onPress={() => router.push("/(tabs)/shop")}
            style={styles.browseBtn}
          />
        </View>
      </Screen>
    )
  }

  return (
    <Screen>
      <View style={styles.header}>
        <ThemedText variant="sectionHeading" color={colors.grey[90]}>
          Shopping Cart
        </ThemedText>
      </View>

      {freeShippingActive ? (
        <View style={styles.freeShip}>
          <ThemedText variant="bodySmall" color={colors.brand.teal}>
            {remainingForFree > 0
              ? `Add ${convertToLocale({
                  amount: remainingForFree,
                  currency_code,
                })} more for free shipping!`
              : "You've unlocked free shipping!"}
          </ThemedText>
        </View>
      ) : null}

      <ScrollView contentContainerStyle={styles.list}>
        {items
          .sort((a, b) =>
            (a.created_at ?? "") > (b.created_at ?? "") ? 1 : -1
          )
          .map((item) => (
            <View key={item.id} style={styles.item}>
              <Image
                source={item.thumbnail}
                style={styles.thumb}
                contentFit="cover"
              />
              <View style={styles.itemBody}>
                <ThemedText
                  variant="productTitle"
                  color={colors.grey[90]}
                  numberOfLines={2}
                >
                  {item.product_title || item.title}
                </ThemedText>
                {item.variant_title ? (
                  <ThemedText variant="bodySmall" color={colors.grey[50]}>
                    {item.variant_title}
                  </ThemedText>
                ) : null}

                <View style={styles.itemFooter}>
                  <View style={styles.stepper}>
                    <Pressable
                      disabled={isMutating}
                      onPress={() =>
                        item.quantity > 1
                          ? update(item.id, item.quantity - 1)
                          : remove(item.id)
                      }
                      style={styles.stepBtn}
                    >
                      <Minus size={16} color={colors.grey[80]} />
                    </Pressable>
                    <ThemedText variant="bodyMedium" color={colors.grey[90]}>
                      {item.quantity}
                    </ThemedText>
                    <Pressable
                      disabled={isMutating}
                      onPress={() => update(item.id, item.quantity + 1)}
                      style={styles.stepBtn}
                    >
                      <Plus size={16} color={colors.grey[80]} />
                    </Pressable>
                  </View>

                  <ThemedText variant="productTitle" color={colors.grey[90]}>
                    {convertToLocale({
                      amount: item.total ?? 0,
                      currency_code,
                    })}
                  </ThemedText>
                </View>
              </View>

              <Pressable
                onPress={() => remove(item.id)}
                style={styles.removeBtn}
                accessibilityLabel="Remove item"
              >
                <Trash2 size={18} color={colors.grey[40]} />
              </Pressable>
            </View>
          ))}
      </ScrollView>

      <View style={styles.summary}>
        <View style={styles.promoBlock}>
          <View style={styles.promoRow}>
            <Input
              containerStyle={styles.promoInput}
              placeholder="Promo code"
              autoCapitalize="characters"
              value={promoInput}
              onChangeText={setPromoInput}
              error={promoError ?? undefined}
            />
            <Button
              title="Apply"
              variant="secondary"
              size="small"
              loading={promoLoading}
              onPress={onApplyPromo}
              style={styles.promoBtn}
            />
          </View>
          {appliedPromos.length > 0 ? (
            <View style={styles.promoChips}>
              {appliedPromos.map((p) => (
                <View key={p.id} style={styles.promoChip}>
                  <Tag size={12} color={colors.brand.teal} />
                  <ThemedText variant="bodySmall" color={colors.brand.teal}>
                    {p.code}
                  </ThemedText>
                  <Pressable
                    onPress={() => onRemovePromo(p.code as string)}
                    hitSlop={6}
                  >
                    <X size={14} color={colors.grey[50]} />
                  </Pressable>
                </View>
              ))}
            </View>
          ) : null}
        </View>

        <View style={styles.summaryRow}>
          <ThemedText variant="body" color={colors.grey[60]}>
            Subtotal
          </ThemedText>
          <ThemedText variant="bodyMedium" color={colors.grey[90]}>
            {convertToLocale({
              amount: cart?.item_subtotal ?? cart?.subtotal ?? 0,
              currency_code,
            })}
          </ThemedText>
        </View>
        {cart?.discount_total ? (
          <View style={styles.summaryRow}>
            <ThemedText variant="body" color={colors.grey[60]}>
              Discount
            </ThemedText>
            <ThemedText variant="bodyMedium" color={colors.sale}>
              -
              {convertToLocale({
                amount: cart.discount_total,
                currency_code,
              })}
            </ThemedText>
          </View>
        ) : null}
        <View style={styles.summaryRow}>
          <ThemedText variant="subheading" color={colors.grey[90]}>
            Total
          </ThemedText>
          <ThemedText variant="subheading" color={colors.grey[90]}>
            {convertToLocale({ amount: cart?.total ?? 0, currency_code })}
          </ThemedText>
        </View>

        <Button
          title="Proceed to Checkout"
          fullWidth
          loading={isMutating}
          onPress={() => router.push("/checkout")}
          style={styles.checkoutBtn}
        />
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
  },
  freeShip: {
    marginHorizontal: spacing.base,
    marginBottom: spacing.sm,
    backgroundColor: colors.brand.tealMuted,
    borderRadius: borderRadius.rounded,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base,
    alignItems: "center",
  },
  list: {
    paddingHorizontal: spacing.base,
    gap: spacing.base,
    paddingBottom: spacing.base,
  },
  item: {
    flexDirection: "row",
    gap: spacing.md,
    backgroundColor: colors.grey[0],
    borderRadius: borderRadius.rounded,
    padding: spacing.sm,
  },
  thumb: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.base,
    backgroundColor: colors.grey[10],
  },
  itemBody: {
    flex: 1,
    gap: spacing.xs,
  },
  itemFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.xs,
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.grey[20],
    borderRadius: borderRadius.circle,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  stepBtn: {
    padding: spacing.xs,
  },
  removeBtn: {
    padding: spacing.xs,
  },
  summary: {
    borderTopWidth: 1,
    borderTopColor: colors.grey[20],
    padding: spacing.base,
    gap: spacing.sm,
    backgroundColor: colors.grey[0],
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  promoBlock: {
    gap: spacing.sm,
    paddingBottom: spacing.sm,
    marginBottom: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.grey[10],
  },
  promoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  promoInput: {
    flex: 1,
  },
  promoBtn: {
    marginTop: 0,
    minWidth: 80,
    alignSelf: "stretch",
    justifyContent: "center",
  },
  promoChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  promoChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.brand.tealMuted,
    borderRadius: borderRadius.circle,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  checkoutBtn: {
    marginTop: spacing.sm,
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    padding: spacing.xl,
  },
  browseBtn: {
    marginTop: spacing.base,
  },
})
