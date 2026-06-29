import { useEffect } from "react"
import { View, Pressable, StyleSheet, ActivityIndicator, FlatList } from "react-native"
import { useRouter } from "expo-router"
import {
  ChevronLeft,
  Bell,
  Clock,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  RefreshCw,
  ChevronRight,
  CheckCheck,
} from "lucide-react-native"
import { Screen } from "@components/layout/Screen"
import { ThemedText } from "@components/ui/ThemedText"
import { Button } from "@components/ui/Button"
import { useNotificationStore } from "@stores/notification-store"
import { useAuthStore } from "@stores/auth-store"
import { colors, spacing, borderRadius, shadows } from "@design/theme"
import { fontFamily } from "@design/typography"
import { DbNotification } from "@api/notifications"

// ─── Helpers ─────────────────────────────────────────────────────────

function getNotificationIcon(title: string) {
  const t = title.toLowerCase()
  if (t.includes("placed")) return { Icon: Clock, bg: "rgba(107, 114, 128, 0.1)", color: "#6B7280" }
  if (t.includes("preparing")) return { Icon: Package, bg: "rgba(86, 174, 191, 0.15)", color: colors.brand.teal }
  if (t.includes("shipped")) return { Icon: Truck, bg: "rgba(59, 130, 246, 0.1)", color: "#3B82F6" }
  if (t.includes("delivered")) return { Icon: CheckCircle, bg: "rgba(16, 185, 129, 0.1)", color: "#10B981" }
  if (t.includes("cancel")) return { Icon: XCircle, bg: "rgba(239, 68, 68, 0.1)", color: "#EF4444" }
  if (t.includes("refund")) return { Icon: RefreshCw, bg: "rgba(245, 158, 11, 0.1)", color: "#F59E0B" }
  return { Icon: Bell, bg: "rgba(86, 174, 191, 0.1)", color: colors.brand.teal }
}

function getRelativeTime(dateString: string) {
  const now = new Date()
  const date = new Date(dateString)
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays === 1) return "Yesterday"
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

// ─── Component ───────────────────────────────────────────────────────

export default function NotificationsScreen() {
  const router = useRouter()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const { notifications, loading, fetchNotifications, markAsRead, markAllAsRead, unreadCount } =
    useNotificationStore()

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications()
    }
  }, [isAuthenticated])

  const handleNotificationPress = (item: DbNotification) => {
    if (item.status === "unread") {
      markAsRead(item.id)
    }
    if (item.order_id) {
      router.push(`/account/orders/${item.order_id}`)
    }
  }

  const renderItem = ({ item }: { item: DbNotification }) => {
    const config = getNotificationIcon(item.title)
    const IconComponent = config.Icon
    const isUnread = item.status === "unread"

    return (
      <Pressable
        style={[
          styles.notificationCard,
          isUnread ? styles.unreadCard : styles.readCard,
        ]}
        onPress={() => handleNotificationPress(item)}
      >
        {/* Left Side Icon */}
        <View style={[styles.iconContainer, { backgroundColor: config.bg }]}>
          <IconComponent size={20} color={config.color} />
          {isUnread && <View style={styles.unreadDot} />}
        </View>

        {/* Content */}
        <View style={styles.contentContainer}>
          <View style={styles.textRow}>
            <ThemedText
              variant={isUnread ? "bodyMedium" : "body"}
              color={colors.grey[90]}
              style={[styles.notificationTitle, isUnread && { fontFamily: fontFamily.interBold }]}
            >
              {item.title}
            </ThemedText>
            <ThemedText variant="bodySmall" color={colors.grey[40]}>
              {getRelativeTime(item.created_at)}
            </ThemedText>
          </View>
          <ThemedText
            variant="bodySmall"
            color={isUnread ? colors.grey[80] : colors.grey[50]}
            style={styles.messageText}
            numberOfLines={2}
          >
            {item.message}
          </ThemedText>
        </View>

        {/* Clickable indicator */}
        {item.order_id && (
          <ChevronRight size={18} color={colors.grey[30]} style={styles.chevron} />
        )}
      </Pressable>
    )
  }

  return (
    <Screen edges={["top", "bottom"]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={8}>
            <ChevronLeft size={24} color={colors.grey[90]} />
          </Pressable>
          <ThemedText variant="sectionHeading" color={colors.grey[90]}>
            Notifications
          </ThemedText>
        </View>

        {isAuthenticated && unreadCount > 0 && (
          <Pressable onPress={markAllAsRead} style={styles.readAllButton} hitSlop={8}>
            <CheckCheck size={16} color={colors.brand.teal} />
            <ThemedText variant="bodySmall" color={colors.brand.teal} style={{ fontFamily: fontFamily.interBold }}>
              Mark all read
            </ThemedText>
          </Pressable>
        )}
      </View>

      {/* Main Content */}
      {loading && notifications.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.brand.teal} />
        </View>
      ) : !isAuthenticated ? (
        <View style={styles.center}>
          <Bell size={48} color={colors.grey[30]} style={styles.emptyIcon} />
          <ThemedText variant="bodyMedium" color={colors.grey[80]} style={[styles.emptyHeading, { fontFamily: fontFamily.interBold }]}>
            Please sign in
          </ThemedText>
          <ThemedText variant="bodySmall" color={colors.grey[50]} style={styles.emptySubheading}>
            Sign in to view your order notifications and account alerts.
          </ThemedText>
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.center}>
          <View style={styles.emptyIconWrapper}>
            <Bell size={48} color={colors.grey[30]} />
          </View>
          <ThemedText variant="bodyMedium" color={colors.grey[80]} style={[styles.emptyHeading, { fontFamily: fontFamily.interBold }]}>
            All caught up!
          </ThemedText>
          <ThemedText variant="bodySmall" color={colors.grey[50]} style={styles.emptySubheading}>
            You have no notifications at the moment. We'll update you here on order status changes.
          </ThemedText>
          <Button
            title="Continue Shopping"
            onPress={() => router.push("/(tabs)/shop")}
            style={styles.emptyBtn}
          />
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          keyExtractor={(item) => item.id}
          onRefresh={fetchNotifications}
          refreshing={loading}
        />
      )}
    </Screen>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.grey[10],
    backgroundColor: colors.grey[0],
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  backButton: {
    paddingRight: spacing.xs,
  },
  readAllButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  listContainer: {
    padding: spacing.base,
  },
  notificationCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderRadius: borderRadius.rounded,
    marginBottom: spacing.sm,
    borderWidth: 1,
    ...shadows.sm,
  },
  unreadCard: {
    backgroundColor: "rgba(86, 174, 191, 0.05)",
    borderColor: "rgba(86, 174, 191, 0.2)",
  },
  readCard: {
    backgroundColor: colors.grey[0],
    borderColor: colors.grey[20],
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  unreadDot: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.sale,
  },
  contentContainer: {
    flex: 1,
    marginLeft: spacing.md,
    gap: 2,
  },
  textRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  notificationTitle: {
    fontSize: 14,
    flex: 1,
    paddingRight: spacing.sm,
  },
  messageText: {
    fontSize: 13,
    lineHeight: 18,
  },
  chevron: {
    marginLeft: spacing.sm,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.xl * 2,
  },
  emptyIconWrapper: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: colors.grey[5],
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  emptyIcon: {
    marginBottom: spacing.lg,
  },
  emptyHeading: {
    fontSize: 18,
    marginBottom: spacing.xs,
    textAlign: "center",
  },
  emptySubheading: {
    textAlign: "center",
    lineHeight: 20,
    marginBottom: spacing.xl,
  },
  emptyBtn: {
    width: "100%",
  },
})
