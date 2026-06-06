import { Text as RNText, TextProps } from "react-native"
import { textStyles } from "@design/typography"
import { colors } from "@design/theme"

type Variant = keyof typeof textStyles

interface ThemedTextProps extends TextProps {
  variant?: Variant
  color?: string
}

export function ThemedText({
  variant = "body",
  color = colors.grey[90],
  style,
  ...rest
}: ThemedTextProps) {
  return <RNText style={[textStyles[variant], { color }, style]} {...rest} />
}
