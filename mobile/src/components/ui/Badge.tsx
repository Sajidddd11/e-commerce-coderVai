import { View, StyleSheet, ViewStyle } from "react-native"
import { colors, borderRadius, spacing } from "@design/theme"
import { ThemedText } from "./ThemedText"

type BadgeVariant = "sale" | "discount" | "new" | "neutral"

interface BadgeProps {
  label: string
  variant?: BadgeVariant
  style?: ViewStyle
}

const BG: Record<BadgeVariant, string> = {
  sale: colors.sale,
  discount: colors.slate[900],
  new: colors.brand.teal,
  neutral: colors.grey[80],
}

export function Badge({ label, variant = "sale", style }: BadgeProps) {
  return (
    <View style={[styles.badge, { backgroundColor: BG[variant] }, style]}>
      <ThemedText variant="bodySmall" color={colors.grey[0]} style={styles.text}>
        {label}
      </ThemedText>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.base,
    alignSelf: "flex-start",
  },
  text: {
    fontWeight: "700",
    fontSize: 11,
  },
})
