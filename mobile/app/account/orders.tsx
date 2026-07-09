import { useEffect, useState } from "react"
import { View, FlatList, Pressable, StyleSheet, ActivityIndicator } from "react-native"
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

// ─── Status badge config (mirrors order detail screen) ────────────────────────

type StatusConfig = {
  label: string
  color: string
  bg: string
}

const STATUS_MAP: Record<string, StatusConfig> = {
  pending:    { label: "Pending",    color: "#6B7280", bg: "rgba(107,114,128,0.1)" },
  processing: { label: "Processing", color: colors.brand.teal, bg: "rgba(86,174,191,0.12)" },
  shipped:    { label: "Shipped",    color: "#3B82F6", bg: "rgba(59,130,246,0.1)" },
  delivered:  { label: "Delivered",  color: "#10B981", bg: "rgba(16,185,129,0.1)" },
  canceled:   { label: "Cancelled",  color: "#EF4444", bg: "rgba(239,68,68,0.1)" },
  refunded:   { label: "Refunded",   color: "#F59E0B", bg: "rgba(245,158,11,0.1)" },
}

function getStatusConfig(order: HttpTypes.StoreOrder): StatusConfig {
  const raw = (order.metadata as any)?.custom_status || order.status || "pending"
  return STATUS_MAP[raw] ?? { label: raw, color: colors.grey[60], bg: colors.grey[10] }
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function OrdersScreen() {
  const router = useRouter()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const [orders, setOrders] = useState<HttpTypes.StoreOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const LIMIT = 10

  const fetchOrders = async (currentOffset: number, init = false) => {
    if (!isAuthenticated) return

    if (init) {
      setLoading(true)
    } else {
      setLoadingMore(true)
    }

    try {
      const data = await listOrders(LIMIT, currentOffset)
      if (init) {
        setOrders(data)
      } else {
        setOrders((prev) => [...prev, ...data])
      }

      if (data.length < LIMIT) {
        setHasMore(false)
      } else {
        setHasMore(true)
      }
      setOffset(currentOffset + LIMIT)
    } catch {
      // ignore
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  useEffect(() => {
    fetchOrders(0, true)
  }, [isAuthenticated])

  const handleLoadMore = () => {
    if (loading || loadingMore || !hasMore) return
    fetchOrders(offset)
  }

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
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.2}
          ListFooterComponent={() => {
            if (!loadingMore) return null
            return (
              <View style={styles.footerLoader}>
                <ActivityIndicator color={colors.brand.teal} size="small" />
              </View>
            )
          }}
          renderItem={({ item: order }) => {
            const status = getStatusConfig(order)
            return (
              <Pressable
                style={styles.orderCard}
                onPress={() => router.push(`/account/orders/${order.id}`)}
              >
                <View style={styles.flex}>
                  {/* Top row: order # + status badge */}
                  <View style={styles.topRow}>
                    <ThemedText variant="bodyMedium" color={colors.grey[90]}>
                      Order #{order.display_id}
                    </ThemedText>
                    <View style={[styles.badge, { backgroundColor: status.bg }]}>
                      <View style={[styles.badgeDot, { backgroundColor: status.color }]} />
                      <ThemedText style={[styles.badgeText, { color: status.color }]}>
                        {status.label}
                      </ThemedText>
                    </View>
                  </View>

                  {/* Date + item count */}
                  <ThemedText variant="bodySmall" color={colors.grey[50]}>
                    {new Date(order.created_at as string).toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}{" "}
                    · {order.items?.length ?? 0} item{(order.items?.length ?? 0) !== 1 ? "s" : ""}
                  </ThemedText>

                  {/* Total */}
                  <ThemedText variant="bodyMedium" color={colors.grey[80]}>
                    {convertToLocale({
                      amount: order.total ?? 0,
                      currency_code: order.currency_code || "bdt",
                    })}
                  </ThemedText>
                </View>
                <ChevronRight size={20} color={colors.grey[40]} />
              </Pressable>
            )
          }}
        />
      )}
    </Screen>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1, gap: 4 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
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
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  footerLoader: {
    paddingVertical: spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },
})
