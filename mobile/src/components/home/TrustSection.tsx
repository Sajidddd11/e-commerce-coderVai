import { View, StyleSheet } from "react-native"
import {
  Truck,
  ShieldCheck,
  RefreshCcw,
  Headphones,
  Award,
  Clock,
} from "lucide-react-native"
import { ThemedText } from "../ui/ThemedText"
import { colors, spacing, borderRadius, shadows } from "@design/theme"

const FEATURES = [
  { Icon: Truck, title: "Fast Delivery", subtitle: "Across Bangladesh" },
  { Icon: ShieldCheck, title: "Secure Payment", subtitle: "SSLCommerz protected" },
  { Icon: RefreshCcw, title: "Easy Returns", subtitle: "Hassle-free policy" },
  { Icon: Headphones, title: "24/7 Support", subtitle: "Always here to help" },
  { Icon: Award, title: "Quality First", subtitle: "Curated products" },
  { Icon: Clock, title: "Quick Dispatch", subtitle: "Same-day handling" },
] as const

interface TrustSectionProps {
  /** Omit outer padding when nested inside Account support section. */
  embedded?: boolean
}

export function TrustSection({ embedded }: TrustSectionProps = {}) {
  return (
    <View style={[styles.grid, embedded && styles.gridEmbedded]}>
      {FEATURES.map(({ Icon, title, subtitle }) => (
        <View key={title} style={styles.card}>
          <View style={styles.iconPill}>
            <Icon size={20} color={colors.brand.teal} />
          </View>
          <ThemedText variant="bodyMedium" color={colors.grey[90]}>
            {title}
          </ThemedText>
          <ThemedText variant="bodySmall" color={colors.grey[50]}>
            {subtitle}
          </ThemedText>
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  gridEmbedded: {
    paddingHorizontal: 0,
  },
  card: {
    width: "31.5%",
    backgroundColor: colors.grey[0],
    borderRadius: borderRadius.large,
    padding: spacing.md,
    gap: spacing.xs,
    alignItems: "flex-start",
    ...shadows.sm,
  },
  iconPill: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.rounded,
    backgroundColor: colors.brand.tealMuted,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xs,
  },
})
