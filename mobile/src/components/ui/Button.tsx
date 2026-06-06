import {
  Pressable,
  ActivityIndicator,
  StyleSheet,
  View,
  ViewStyle,
  PressableProps,
} from "react-native"
import { colors, borderRadius, spacing, shadows } from "@design/theme"
import { ThemedText } from "./ThemedText"

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

const VARIANT_BG: Record<Variant, string> = {
  primary: colors.slate[900],
  secondary: colors.grey[0],
  brand: colors.brand.teal,
  danger: colors.error,
  ghost: "transparent",
}

const VARIANT_TEXT: Record<Variant, string> = {
  primary: colors.grey[0],
  secondary: colors.slate[900],
  brand: colors.grey[0],
  danger: colors.grey[0],
  ghost: colors.slate[900],
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
            ? colors.grey[20]
            : VARIANT_BG[variant],
          paddingVertical: pad.v,
          paddingHorizontal: pad.h,
          opacity: pressed ? 0.85 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
          width: fullWidth ? "100%" : undefined,
          borderWidth: variant === "secondary" ? 1 : 0,
          borderColor: colors.grey[30],
        },
        variant === "primary" && !isDisabled ? shadows.sm : null,
        style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator
          color={isDisabled ? colors.grey[50] : VARIANT_TEXT[variant]}
        />
      ) : (
        <View style={styles.content}>
          {leftIcon}
          <ThemedText
            variant="button"
            color={isDisabled ? colors.grey[50] : VARIANT_TEXT[variant]}
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
