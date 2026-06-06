import { useState } from "react"
import {
  View,
  TextInput,
  Pressable,
  StyleSheet,
  type TextInputProps,
} from "react-native"
import { Search, X } from "lucide-react-native"
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
  placeholder?: string
}

export function ProductSearchBar({
  value,
  onChangeText,
  onSubmit,
  onFocus,
  onBlur,
  onClear,
  placeholder,
  autoFocus,
}: ProductSearchBarProps) {
  const [focused, setFocused] = useState(false)
  const animatedPlaceholder = useAnimatedPlaceholder()
  const displayPlaceholder = placeholder || animatedPlaceholder

  const submit = () => {
    const term = value.trim()
    if (term) onSubmit(term)
  }

  return (
    <View style={styles.wrap}>
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
        placeholderTextColor="#6B7280"
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

      <Pressable onPress={submit} style={styles.submitBtn}>
        <Search size={12} color="white" />
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 9999, // rounded-full to match home page
    borderWidth: 2,
    borderColor: "#E5E7EB", // border-gray-200
    paddingLeft: 12,
    paddingRight: 6,
    paddingVertical: 6,
    gap: 8,
  },
  input: {
    flex: 1,
    padding: 0,
    fontFamily: fontFamily.interRegular,
    fontSize: fontSize.xs,
    color: "#111827",
    backgroundColor: "transparent",
    minHeight: 24, // Matches the button height
  },
  iconBtn: {
    paddingHorizontal: 4,
    justifyContent: "center",
  },
  submitBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#56AEBF",
    justifyContent: "center",
    alignItems: "center",
  },
})
