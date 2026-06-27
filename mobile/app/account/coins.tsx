import { useEffect, useState } from "react"
import {
  View,
  ScrollView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from "react-native"
import { useRouter } from "expo-router"
import { ChevronLeft } from "lucide-react-native"
import { Screen } from "@components/layout/Screen"
import { ThemedText } from "@components/ui/ThemedText"
import { CoinIcon } from "@components/ui/CoinIcon"
import { retrieveLoyaltyDetails, LoyaltyAccount, LoyaltyHistory } from "@api/loyalty"
import { colors, spacing, borderRadius } from "@design/theme"

export default function CoinsScreen() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [account, setAccount] = useState<LoyaltyAccount | null>(null)
  const [history, setHistory] = useState<LoyaltyHistory[]>([])

  useEffect(() => {
    retrieveLoyaltyDetails()
      .then((res) => {
        setAccount(res.account)
        setHistory(res.history || [])
      })
      .finally(() => setLoading(false))
  }, [])

  const pointsBalance = account?.points || 0
  const pointsValueBDT = pointsBalance / 100

  const getTransactionInfo = (type: string) => {
    switch (type) {
      case "earn":
        return { label: "Earned Coins", color: colors.success }
      case "redeem":
        return { label: "Redeemed Coins", color: colors.error }
      case "refund":
        return { label: "Refunded Coins", color: colors.brand.teal }
      case "admin_adjustment":
        return { label: "Admin Adjustment", color: colors.grey[70] }
      default:
        return { label: "Coins Transaction", color: colors.grey[70] }
    }
  }

  return (
    <Screen edges={["top"]}>
      {/* Header */}
      <View style={styles.header as ViewStyle}>
        <Pressable onPress={() => router.back()} style={styles.back as ViewStyle} hitSlop={8}>
          <ChevronLeft size={24} color={colors.grey[90]} />
        </Pressable>
        <ThemedText variant="sectionHeading" color={colors.grey[90]}>
          Zahan Coins
        </ThemedText>
      </View>

      {loading ? (
        <View style={styles.loaderContainer as ViewStyle}>
          <ActivityIndicator size="large" color={colors.brand.teal} />
          <ThemedText variant="bodySmall" color={colors.grey[50]} style={{ marginTop: 8 }}>
            Loading your balance...
          </ThemedText>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.container as ViewStyle} showsVerticalScrollIndicator={false}>
          {/* Zahan Coins Balance Card */}
          <View style={styles.balanceCard as ViewStyle}>
            <View style={styles.glowDecoration1 as ViewStyle} />
            <View style={styles.glowDecoration2 as ViewStyle} />
            
            <View style={styles.cardHeaderRow as ViewStyle}>
              <View style={styles.iconCircle as ViewStyle}>
                <CoinIcon size={22} />
              </View>
              <ThemedText style={styles.cardTitle as TextStyle} color="rgba(255, 255, 255, 0.85)">
                ZAHAN COINS
              </ThemedText>
            </View>

            <View style={styles.balanceRow as ViewStyle}>
              <ThemedText style={styles.balanceText as TextStyle}>
                {pointsBalance}
              </ThemedText>
              <ThemedText style={styles.coinsSuffix as TextStyle}>
                Coins
              </ThemedText>
            </View>

            <View style={styles.valueRow as ViewStyle}>
              <ThemedText style={styles.valueText as TextStyle}>
                Equivalent Value: BDT {pointsValueBDT.toFixed(2)}
              </ThemedText>
            </View>

            <View style={styles.cardFooter as ViewStyle}>
              <ThemedText style={styles.rateRuleText as TextStyle}>
                100 Coins = BDT 1.00 Discount at checkout
              </ThemedText>
            </View>
          </View>

          {/* History Section */}
          <View style={styles.historySection as ViewStyle}>
            <ThemedText variant="subheading" color={colors.grey[80]} style={styles.historyTitle as TextStyle}>
              Transaction History
            </ThemedText>

            {history.length === 0 ? (
              <View style={styles.emptyHistory as ViewStyle}>
                <ThemedText variant="body" color={colors.grey[40]} style={{ fontStyle: "italic" }}>
                  No transaction history yet. Coins earned on completed orders will appear here.
                </ThemedText>
              </View>
            ) : (
              <View style={styles.historyList as ViewStyle}>
                {history.map((item, idx) => {
                  const info = getTransactionInfo(item.type)
                  const isPositive = item.points > 0
                  const formattedDate = new Date(item.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })

                  return (
                    <View
                      key={item.id}
                      style={[
                        styles.historyItem as ViewStyle,
                        idx === history.length - 1 && { borderBottomWidth: 0 },
                      ]}
                    >
                      <View style={styles.historyItemLeft as ViewStyle}>
                        <ThemedText variant="bodyMedium" color={colors.grey[90]} style={styles.historyItemLabel as TextStyle}>
                          {info.label}
                        </ThemedText>
                        {item.description ? (
                          <ThemedText variant="bodySmall" color={colors.grey[50]} style={styles.historyItemDesc as TextStyle}>
                            {item.description}
                          </ThemedText>
                        ) : null}
                        <ThemedText variant="bodySmall" color={colors.grey[40]}>
                          {formattedDate}
                        </ThemedText>
                      </View>

                      <View style={styles.historyItemRight as ViewStyle}>
                        <ThemedText
                          variant="subheading"
                          color={isPositive ? colors.success : colors.error}
                          style={styles.pointsText as TextStyle}
                        >
                          {isPositive ? "+" : ""}
                          {item.points}
                        </ThemedText>
                      </View>
                    </View>
                  )
                })}
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </Screen>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.grey[20],
    backgroundColor: "white",
  },
  back: { padding: spacing.xs },
  container: {
    padding: spacing.base,
    gap: spacing.lg,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  balanceCard: {
    backgroundColor: colors.brand.teal,
    borderRadius: borderRadius.large,
    padding: 24,
    position: "relative",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    gap: 12,
  },
  glowDecoration1: {
    position: "absolute",
    top: -40,
    right: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    zIndex: -1,
  },
  glowDecoration2: {
    position: "absolute",
    bottom: -40,
    left: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    zIndex: -1,
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 12,
    fontFamily: "Inter-SemiBold",
    fontWeight: "600",
    letterSpacing: 1.5,
  },
  balanceRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    marginTop: 8,
    paddingVertical: 4,
  },
  balanceText: {
    color: "white",
    fontSize: 40,
    fontFamily: "Inter-Bold",
    fontWeight: "700",
    lineHeight: 48,
  },
  coinsSuffix: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 18,
    fontFamily: "Inter-SemiBold",
    lineHeight: 22,
    marginBottom: 6,
  },
  valueRow: {
    marginTop: -4,
  },
  valueText: {
    color: "white",
    fontSize: 14,
    fontFamily: "Inter-Medium",
    fontWeight: "600",
  },
  cardFooter: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
    paddingTop: 12,
  },
  rateRuleText: {
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: 11,
    fontFamily: "Inter-Regular",
  },
  historySection: {
    gap: 16,
  },
  historyTitle: {
    fontWeight: "600",
    letterSpacing: -0.5,
  },
  emptyHistory: {
    padding: spacing.xl,
    backgroundColor: colors.grey[5],
    borderRadius: borderRadius.large,
    borderWidth: 1,
    borderColor: colors.grey[20],
    alignItems: "center",
    justifyContent: "center",
  },
  historyList: {
    backgroundColor: "white",
    borderRadius: borderRadius.large,
    borderWidth: 1,
    borderColor: colors.grey[20],
    overflow: "hidden",
  },
  historyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.grey[20],
  },
  historyItemLeft: {
    flex: 1,
    gap: 4,
  },
  historyItemLabel: {
    fontWeight: "600",
  },
  historyItemDesc: {
    lineHeight: 16,
  },
  historyItemRight: {
    justifyContent: "center",
    alignItems: "flex-end",
    paddingLeft: 12,
  },
  pointsText: {
    fontWeight: "600",
    fontSize: 16,
  },
})
