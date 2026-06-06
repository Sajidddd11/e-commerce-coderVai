import { Text as RNText, TextProps } from "react-native"
import { textStyles } from "@design/typography"
import { useAppTheme } from "@hooks/useAppTheme"

type Variant = keyof typeof textStyles

interface ThemedTextProps extends TextProps {
  variant?: Variant
  color?: string
}

export function ThemedText({
  variant = "body",
  color,
  style,
  ...rest
}: ThemedTextProps) {
  const { colors } = useAppTheme()
  const finalColor = color ?? colors.text

  return <RNText style={[textStyles[variant], { color: finalColor }, style]} {...rest} />
}
