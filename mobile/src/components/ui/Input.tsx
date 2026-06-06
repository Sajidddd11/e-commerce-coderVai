import { useState } from "react"
import {
  View,
  TextInput,
  TextInputProps,
  StyleSheet,
  ViewStyle,
  StyleProp,
  TextStyle,
} from "react-native"
import { colors, borderRadius, spacing } from "@design/theme"
import { fontFamily, fontSize } from "@design/typography"
import { ThemedText } from "./ThemedText"

interface InputProps extends TextInputProps {
  label?: string
  error?: string
  containerStyle?: ViewStyle
  style?: StyleProp<TextStyle>
}

export function Input({
  label,
  error,
  containerStyle,
  style,
  onFocus,
  onBlur,
  ...rest
}: InputProps) {
  const [focused, setFocused] = useState(false)

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? (
        <ThemedText variant="bodySmall" color={colors.grey[70]} style={styles.label}>
          {label}
        </ThemedText>
      ) : null}
      <TextInput
        placeholderTextColor={colors.grey[40]}
        style={[
          styles.input,
          {
            borderColor: error
              ? colors.error
              : focused
              ? colors.brand.teal
              : colors.grey[20],
          },
          style,
        ]}
        onFocus={(e) => {
          setFocused(true)
          onFocus?.(e)
        }}
        onBlur={(e) => {
          setFocused(false)
          onBlur?.(e)
        }}
        {...rest}
      />
      {error ? (
        <ThemedText variant="bodySmall" color={colors.error} style={styles.error}>
          {error}
        </ThemedText>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    gap: spacing.xs,
  },
  label: {
    marginBottom: 2,
  },
  input: {
    backgroundColor: colors.grey[10],
    borderWidth: 1,
    borderRadius: borderRadius.base,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    fontFamily: fontFamily.body,
    fontSize: fontSize.md,
    color: colors.grey[90],
    minHeight: 48,
  },
  error: {
    marginTop: 2,
  },
})
