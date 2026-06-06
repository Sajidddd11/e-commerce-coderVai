import { useState } from "react"
import {
  View,
  TextInput,
  Pressable,
  StyleSheet,
  type TextInputProps,
} from "react-native"
import { Search, X } from "lucide-react-native"
import { colors, spacing, borderRadius } from "@design/theme"
import { fontFamily, fontSize } from "@design/typography"

interface ProductSearchBarProps extends Pick<TextInputProps, "autoFocus"> {
  value: string
  onChangeText: (text: string) => void
  onSubmit: (term: string) => void
  onFocus?: () => void
  onBlur?: () => void
  onClear?: () => void
  placeholder?: string
}

/** Web-style search field — white surface, bordered, submit on right. */
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
    <View
      style={[
        styles.wrap,
        focused && styles.wrapFocused,
      ]}
    >
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
        placeholderTextColor={colors.grey[40]}
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
          <X size={18} color={colors.grey[50]} />
        </Pressable>
      ) : null}

      <Pressable onPress={submit} style={styles.submitBtn} hitSlop={4}>
        <Search size={20} color={focused ? colors.brand.teal : colors.grey[50]} />
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.grey[0],
    borderRadius: borderRadius.rounded,
    borderWidth: 2,
    borderColor: colors.grey[20],
    paddingLeft: spacing.base,
    paddingRight: spacing.xs,
    minHeight: 44,
  },
  wrapFocused: {
    borderColor: colors.brand.teal,
  },
  input: {
    flex: 1,
    paddingVertical: spacing.sm,
    fontFamily: fontFamily.body,
    fontSize: fontSize.base,
    color: colors.grey[90],
  },
  iconBtn: {
    padding: spacing.xs,
    marginRight: spacing.xs,
  },
  submitBtn: {
    padding: spacing.sm,
    borderRadius: borderRadius.base,
  },
})
