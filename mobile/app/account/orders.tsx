import { useEffect, useState } from "react"
import { View, ScrollView, Pressable, StyleSheet, ActivityIndicator } from "react-native"
import { useRouter } from "expo-router"
import { ChevronLeft, ChevronRight, Package } from "lucide-react-native"
import { HttpTypes } from "@medusajs/types"
import { Screen } from "@components/layout/Screen"
import { ThemedText } from "@components/ui/ThemedText"
import { Button } from "@components/ui/Button"
import { useAuthStore } from "@stores/auth-store"
import { listOrders } from "@api/orders"
import { convertToLocale } from "@utils/money"
import { colors, spacing, borderRadius } from "@design/theme"

export default function OrdersScreen() {
  const router = useRouter()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const [orders, setOrders] = useState<HttpTypes.StoreOrder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false)
      return
    }
    listOrders(20, 0)
      .then(setOrders)
      .finally(() => setLoading(false))
  }, [isAuthenticated])

  return (
    <Screen edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.back} hitSlop={8}>
          <ChevronLeft size={24} color={colors.grey[90]} />
        </Pressable>
        <ThemedText variant="sectionHeading" color={colors.grey[90]}>
          My Orders
        </ThemedText>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.brand.teal} />
        </View>
      ) : !isAuthenticated ? (
        <View style={styles.center}>
          <ThemedText variant="body" color={colors.grey[50]}>
            Please sign in to view your orders.
          </ThemedText>
        </View>
      ) : orders.length === 0 ? (
        <View style={styles.center}>
          <Package size={48} color={colors.grey[30]} />
          <ThemedText variant="body" color={colors.grey[50]}>
            You have no orders yet.
          </ThemedText>
          <Button title="Start shopping" onPress={() => router.push("/(tabs)/shop")} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {orders.map((order) => (
            <Pressable
              key={order.id}
              style={styles.orderCard}
              onPress={() => router.push(`/account/orders/${order.id}`)}
            >
              <View style={styles.flex}>
                <ThemedText variant="bodyMedium" color={colors.grey[90]}>
                  Order #{order.display_id}
                </ThemedText>
                <ThemedText variant="bodySmall" color={colors.grey[50]}>
                  {new Date(order.created_at as string).toLocaleDateString()} ·{" "}
                  {order.items?.length ?? 0} item(s)
                </ThemedText>
                <ThemedText variant="bodyMedium" color={colors.grey[80]}>
                  {convertToLocale({
                    amount: order.total ?? 0,
                    currency_code: order.currency_code || "bdt",
                  })}
                </ThemedText>
              </View>
              <ChevronRight size={20} color={colors.grey[40]} />
            </Pressable>
          ))}
        </ScrollView>
      )}
    </Screen>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1, gap: 2 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.grey[20],
  },
  back: { padding: spacing.xs },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.base,
    padding: spacing.xl,
  },
  list: { padding: spacing.base, gap: spacing.sm },
  orderCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.grey[0],
    borderWidth: 1,
    borderColor: colors.grey[20],
    borderRadius: borderRadius.rounded,
    padding: spacing.base,
  },
})
