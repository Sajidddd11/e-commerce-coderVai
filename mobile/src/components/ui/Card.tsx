import { View, ViewProps, StyleSheet } from "react-native"
import { colors, borderRadius, shadows } from "@design/theme"

interface CardProps extends ViewProps {
  elevated?: boolean
  padded?: boolean
}

export function Card({
  elevated = true,
  padded = false,
  style,
  children,
  ...rest
}: CardProps) {
  return (
    <View
      style={[
        styles.card,
        elevated ? shadows.md : null,
        padded ? styles.padded : null,
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.grey[0],
    borderRadius: borderRadius.rounded,
    overflow: "hidden",
  },
  padded: {
    padding: 16,
  },
})
