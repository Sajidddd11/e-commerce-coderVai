import { View, ViewProps, StyleSheet } from "react-native"
import { useAppTheme } from "@hooks/useAppTheme";
import { borderRadius, shadows } from "@design/theme"

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
  const { colors } = useAppTheme();

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.background },
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
    borderRadius: borderRadius.rounded,
    overflow: "hidden",
  },
  padded: {
    padding: 16,
  },
})
