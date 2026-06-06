import { View, StyleSheet, ViewStyle } from "react-native"
import { borderRadius, spacing } from "@design/theme"
import { ThemedText } from "./ThemedText"
import { useAppTheme } from "@hooks/useAppTheme"

type BadgeVariant = "sale" | "discount" | "new" | "neutral"

interface BadgeProps {
  label: string
  variant?: BadgeVariant
  style?: ViewStyle
}

export function Badge({ label, variant = "sale", style }: BadgeProps) {
  const { colors } = useAppTheme()

  const BG: Record<BadgeVariant, string> = {
    sale: colors.sale,
    discount: colors.text,
    new: colors.primary,
    neutral: colors.textMuted,
  }

  return (
    <View style={[styles.badge, { backgroundColor: BG[variant] }, style]}>
      <ThemedText variant="bodySmall" color={colors.background} style={styles.text}>
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
