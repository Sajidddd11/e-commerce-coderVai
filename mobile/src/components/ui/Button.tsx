import {
  Pressable,
  ActivityIndicator,
  StyleSheet,
  View,
  ViewStyle,
  PressableProps,
} from "react-native"
import { borderRadius, spacing, shadows } from "@design/theme"
import { ThemedText } from "./ThemedText"
import { useAppTheme } from "@hooks/useAppTheme"

type Variant = "primary" | "secondary" | "brand" | "danger" | "ghost"
type Size = "small" | "base" | "large"

interface ButtonProps extends Omit<PressableProps, "style"> {
  title: string
  variant?: Variant
  size?: Size
  loading?: boolean
  disabled?: boolean
  fullWidth?: boolean
  style?: ViewStyle
  leftIcon?: React.ReactNode
}

const SIZE_PADDING: Record<Size, { v: number; h: number }> = {
  small: { v: spacing.sm, h: spacing.base },
  base: { v: spacing.md, h: spacing.lg },
  large: { v: spacing.base, h: spacing.xl },
}

export function Button({
  title,
  variant = "primary",
  size = "base",
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
  leftIcon,
  ...rest
}: ButtonProps) {
  const { colors } = useAppTheme();

  const VARIANT_BG: Record<Variant, string> = {
    primary: colors.text,
    secondary: colors.background,
    brand: colors.primary,
    danger: colors.error,
    ghost: "transparent",
  }

  const VARIANT_TEXT: Record<Variant, string> = {
    primary: colors.background,
    secondary: colors.text,
    brand: colors.background,
    danger: colors.background,
    ghost: colors.text,
  }

  const isDisabled = disabled || loading
  const pad = SIZE_PADDING[size]

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: isDisabled
            ? colors.border
            : VARIANT_BG[variant],
          paddingVertical: pad.v,
          paddingHorizontal: pad.h,
          opacity: pressed ? 0.85 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
          width: fullWidth ? "100%" : undefined,
          borderWidth: variant === "secondary" ? 1 : 0,
          borderColor: colors.border,
        },
        variant === "primary" && !isDisabled ? shadows.sm : null,
        style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator
          color={isDisabled ? colors.textMuted : VARIANT_TEXT[variant]}
        />
      ) : (
        <View style={styles.content}>
          {leftIcon}
          <ThemedText
            variant="button"
            color={isDisabled ? colors.textMuted : VARIANT_TEXT[variant]}
          >
            {title}
          </ThemedText>
        </View>
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  base: {
    borderRadius: borderRadius.rounded,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
})
