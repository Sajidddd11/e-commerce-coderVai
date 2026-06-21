import { useState } from "react"
import {
  View,
  TextInput,
  Pressable,
  StyleSheet,
  type TextInputProps,
  type StyleProp,
  type ViewStyle,
} from "react-native"
import Animated from "react-native-reanimated"
import { Search, X, SlidersHorizontal } from "lucide-react-native"
import { colors } from "@design/theme"
import { fontFamily, fontSize } from "@design/typography"
import { useAnimatedPlaceholder } from "@hooks/useAnimatedPlaceholder"

interface ProductSearchBarProps extends Pick<TextInputProps, "autoFocus"> {
  value: string
  onChangeText: (text: string) => void
  onSubmit: (term: string) => void
  onFocus?: () => void
  onBlur?: () => void
  onClear?: () => void
  onPressFilter?: () => void
  placeholder?: string
  containerStyle?: any // any to accept AnimatedStyle
}

export function ProductSearchBar({
  value,
  onChangeText,
  onSubmit,
  onFocus,
  onBlur,
  onClear,
  onPressFilter,
  placeholder,
  autoFocus,
  containerStyle,
}: ProductSearchBarProps) {
  const [focused, setFocused] = useState(false)
  const animatedPlaceholder = useAnimatedPlaceholder()
  const displayPlaceholder = placeholder || animatedPlaceholder

  const submit = () => {
    const term = value.trim()
    if (term) onSubmit(term)
  }

  return (
    <Animated.View style={[styles.wrap, containerStyle]}>
      <Search size={20} color={colors.grey[40]} />

      <TextInput
        value={value}
        onChangeText={onChangeText}
        onFocus={() => {
          setFocused(true)
          onFocus?.()
        }}
        onBlur={() => {
          setFocused(false)
          onBlur?.()
        }}
        placeholder={displayPlaceholder}
        placeholderTextColor={colors.grey[50]}
        returnKeyType="search"
        onSubmitEditing={submit}
        autoFocus={autoFocus}
        autoCapitalize="none"
        autoCorrect={false}
        style={styles.input}
      />

      {value.length > 0 ? (
        <Pressable
          hitSlop={8}
          onPress={() => {
            onChangeText("")
            onClear?.()
          }}
          style={styles.iconBtn}
        >
          <X size={16} color={colors.grey[50]} />
        </Pressable>
      ) : null}

      <Pressable onPress={onPressFilter || submit} style={styles.submitBtn}>
        <SlidersHorizontal size={16} color="white" />
      </Pressable>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 9999, // rounded-full
    borderWidth: 2,
    borderColor: "#E5E7EB", // border-gray-200
    paddingLeft: 16,
    paddingRight: 6,
    paddingVertical: 6,
    gap: 8,
  },
  input: {
    flex: 1,
    padding: 0,
    fontFamily: fontFamily.interRegular,
    fontSize: fontSize.sm, // matched with hero
    color: "#111827",
    backgroundColor: "transparent",
    minHeight: 24,
  },
  iconBtn: {
    paddingHorizontal: 4,
    justifyContent: "center",
  },
  submitBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.brand.teal,
    justifyContent: "center",
    alignItems: "center",
  },
})
