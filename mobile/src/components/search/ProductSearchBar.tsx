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
  placeholder = "Search products...",
  autoFocus,
}: ProductSearchBarProps) {
  const [focused, setFocused] = useState(false)

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
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
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
        <Search size={16} color="white" />
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 8, // rounded-lg
    borderWidth: 2,
    borderColor: colors.grey[20], // border-gray-200
    overflow: "hidden",
  },
  input: {
    flex: 1,
    height: 40, // h-10
    paddingHorizontal: 16, // px-4
    fontFamily: "Inter-Regular",
    fontSize: 14, // text-sm
    color: colors.slate[900], // text-gray-900
    backgroundColor: "transparent",
  },
  iconBtn: {
    paddingHorizontal: 8,
    height: "100%",
    justifyContent: "center",
  },
  submitBtn: {
    width: 44, // w-11
    height: 40, // h-10
    backgroundColor: colors.brand.teal, // bg-[#56AEBF]
    justifyContent: "center",
    alignItems: "center",
  },
})
