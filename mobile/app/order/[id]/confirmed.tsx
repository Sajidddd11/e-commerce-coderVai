import { useEffect, useState } from "react"
import { View, ScrollView, StyleSheet, ActivityIndicator } from "react-native"
import { Image } from "expo-image"
import { useLocalSearchParams, useRouter } from "expo-router"
import { CheckCircle2, MessageCircle } from "lucide-react-native"
import { HttpTypes } from "@medusajs/types"
import { Screen } from "@components/layout/Screen"
import { ThemedText } from "@components/ui/ThemedText"
import { Button } from "@components/ui/Button"
import { retrieveOrder } from "@api/orders"
import { paymentTitle } from "@utils/shipping"
import { trackPurchase } from "@utils/facebook-analytics"
import { convertToLocale } from "@utils/money"
import { WHATSAPP_NUMBER } from "@design/constants"
import { Linking } from "react-native"
import { colors, spacing, borderRadius } from "@design/theme"

export default function OrderConfirmedScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const [order, setOrder] = useState<HttpTypes.StoreOrder | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    retrieveOrder(id)
      .then((o) => {
        setOrder(o)
        if (o) {
          trackPurchase({
            orderId: o.id,
            value: o.total ?? undefined,
            currency: o.currency_code ?? undefined,
          })
        }
      })
      .finally(() => setLoading(false))
  }, [id])

  const currency = order?.currency_code || "bdt"
  const provider =
    order?.payment_collections?.[0]?.payments?.[0]?.provider_id ?? ""

  if (loading) {
    return (
      <Screen>
        <View style={styles.center}>
          <ActivityIndicator color={colors.brand.teal} />
        </View>
      </Screen>
    )
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.hero}>
          <CheckCircle2 size={64} color={colors.success} />
          <ThemedText variant="sectionHeading" color={colors.grey[90]}>
            Thank you!
          </ThemedText>
          <ThemedText
            variant="body"
            color={colors.grey[60]}
            style={styles.centerText}
          >
            Your order has been placed successfully. We&apos;ll send updates by
            SMS.
          </ThemedText>
          {order ? (
            <ThemedText variant="bodyMedium" color={colors.grey[80]}>
              Order #{order.display_id}
            </ThemedText>
          ) : null}
        </View>

        {order ? (
          <>
            <View style={styles.card}>
              <ThemedText variant="subheading" color={colors.grey[90]}>
                Items
              </ThemedText>
              {order.items?.map((item) => (
                <View key={item.id} style={styles.itemRow}>
                  {item.thumbnail ? (
                    <Image
                      source={item.thumbnail}
                      style={styles.thumb}
                      contentFit="cover"
                    />
                  ) : null}
                  <View style={styles.flex}>
                    <ThemedText
                      variant="body"
                      color={colors.grey[90]}
                      numberOfLines={2}
                    >
                      {item.product_title || item.title}
                    </ThemedText>
                    <ThemedText variant="bodySmall" color={colors.grey[50]}>
                      Qty {item.quantity}
                    </ThemedText>
                  </View>
                  <ThemedText variant="bodyMedium" color={colors.grey[90]}>
                    {convertToLocale({
                      amount: item.total ?? 0,
                      currency_code: currency,
                    })}
                  </ThemedText>
                </View>
              ))}
            </View>

            <View style={styles.card}>
              <ThemedText variant="subheading" color={colors.grey[90]}>
                Summary
              </ThemedText>
              <Row
                label="Subtotal"
                value={convertToLocale({
                  amount: order.item_subtotal ?? 0,
                  currency_code: currency,
                })}
              />
              <Row
                label="Shipping"
                value={convertToLocale({
                  amount: order.shipping_total ?? 0,
                  currency_code: currency,
                })}
              />
              {order.discount_total ? (
                <Row
                  label="Discount"
                  value={`-${convertToLocale({
                    amount: order.discount_total,
                    currency_code: currency,
                  })}`}
                  valueColor={colors.sale}
                />
              ) : null}
              <View style={styles.divider} />
              <Row
                label="Total"
                bold
                value={convertToLocale({
                  amount: order.total ?? 0,
                  currency_code: currency,
                })}
              />
              {provider ? (
                <ThemedText variant="bodySmall" color={colors.grey[50]}>
                  Paid via {paymentTitle(provider)}
                </ThemedText>
              ) : null}
            </View>

            {order.shipping_address ? (
              <View style={styles.card}>
                <ThemedText variant="subheading" color={colors.grey[90]}>
                  Delivery
                </ThemedText>
                <ThemedText variant="body" color={colors.grey[60]}>
                  {order.shipping_address.first_name}{" "}
                  {order.shipping_address.last_name}
                </ThemedText>
                <ThemedText variant="body" color={colors.grey[60]}>
                  {order.shipping_address.address_1},{" "}
                  {order.shipping_address.city}
                </ThemedText>
                <ThemedText variant="body" color={colors.grey[60]}>
                  {order.shipping_address.phone}
                </ThemedText>
              </View>
            ) : null}
          </>
        ) : (
          <View style={styles.card}>
            <ThemedText variant="body" color={colors.grey[60]}>
              Your payment was received. You can view this order in your account.
            </ThemedText>
          </View>
        )}

        <View style={styles.helpCard}>
          <ThemedText variant="bodyMedium" color={colors.grey[90]}>
            Need help with your order?
          </ThemedText>
          <Button
            title="Chat on WhatsApp"
            variant="brand"
            leftIcon={<MessageCircle size={18} color={colors.grey[0]} />}
            onPress={() =>
              Linking.openURL(`https://wa.me/${WHATSAPP_NUMBER}`).catch(() => {})
            }
          />
        </View>

        <Button
          title="Continue Shopping"
          variant="secondary"
          fullWidth
          onPress={() => router.replace("/(tabs)")}
          style={styles.continueBtn}
        />
      </ScrollView>
    </Screen>
  )
}

function Row({
  label,
  value,
  bold,
  valueColor,
}: {
  label: string
  value: string
  bold?: boolean
  valueColor?: string
}) {
  return (
    <View style={styles.itemRow}>
      <ThemedText
        variant={bold ? "subheading" : "body"}
        color={colors.grey[bold ? 90 : 60]}
      >
        {label}
      </ThemedText>
      <ThemedText
        variant={bold ? "subheading" : "bodyMedium"}
        color={valueColor ?? colors.grey[90]}
      >
        {value}
      </ThemedText>
    </View>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  centerText: { textAlign: "center" },
  scroll: { padding: spacing.base, gap: spacing.base, paddingBottom: spacing.xl },
  hero: {
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.xl,
  },
  card: {
    backgroundColor: colors.grey[0],
    borderWidth: 1,
    borderColor: colors.grey[20],
    borderRadius: borderRadius.rounded,
    padding: spacing.base,
    gap: spacing.sm,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  thumb: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.base,
    backgroundColor: colors.grey[10],
  },
  divider: {
    height: 1,
    backgroundColor: colors.grey[20],
    marginVertical: spacing.xs,
  },
  helpCard: {
    backgroundColor: colors.grey[5],
    borderRadius: borderRadius.rounded,
    padding: spacing.base,
    gap: spacing.md,
  },
  continueBtn: { marginTop: spacing.sm },
})
