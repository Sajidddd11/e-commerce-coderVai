import { useMemo, useState } from "react"
import {
  View,
  Modal,
  Pressable,
  FlatList,
  TextInput,
  StyleSheet,
} from "react-native"
import { ChevronDown, Search, X, Check } from "lucide-react-native"
import { ThemedText } from "@components/ui/ThemedText"
import { BANGLADESH_DISTRICTS } from "@design/constants"
import { colors, spacing, borderRadius } from "@design/theme"
import { fontFamily, fontSize } from "@design/typography"

interface DistrictPickerProps {
  label?: string
  value: string
  onChange: (district: string) => void
}

export function DistrictPicker({ label, value, onChange }: DistrictPickerProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return BANGLADESH_DISTRICTS as readonly string[]
    return BANGLADESH_DISTRICTS.filter((d) => d.toLowerCase().includes(q))
  }, [query])

  return (
    <View style={styles.wrap}>
      {label ? (
        <ThemedText variant="bodySmall" color={colors.grey[70]}>
          {label}
        </ThemedText>
      ) : null}

      <Pressable
        style={styles.trigger}
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel="Select district"
      >
        <ThemedText
          variant="body"
          color={value ? colors.grey[90] : colors.grey[40]}
        >
          {value || "Select district"}
        </ThemedText>
        <ChevronDown size={18} color={colors.grey[50]} />
      </Pressable>

      <Modal
        visible={open}
        animationType="slide"
        transparent
        onRequestClose={() => setOpen(false)}
      >
        <View style={styles.backdrop}>
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <ThemedText variant="subheading" color={colors.grey[90]}>
                Select district
              </ThemedText>
              <Pressable onPress={() => setOpen(false)} hitSlop={8}>
                <X size={22} color={colors.grey[60]} />
              </Pressable>
            </View>

            <View style={styles.searchRow}>
              <Search size={18} color={colors.grey[50]} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Search districts"
                placeholderTextColor={colors.grey[40]}
                style={styles.searchInput}
                autoCorrect={false}
              />
            </View>

            <FlatList
              data={filtered}
              keyExtractor={(item) => item}
              keyboardShouldPersistTaps="handled"
              style={styles.list}
              renderItem={({ item }) => {
                const active = item === value
                return (
                  <Pressable
                    style={styles.row}
                    onPress={() => {
                      onChange(item)
                      setQuery("")
                      setOpen(false)
                    }}
                  >
                    <ThemedText
                      variant="body"
                      color={active ? colors.brand.teal : colors.grey[80]}
                    >
                      {item}
                    </ThemedText>
                    {active ? (
                      <Check size={18} color={colors.brand.teal} />
                    ) : null}
                  </Pressable>
                )
              }}
              ListEmptyComponent={
                <View style={styles.empty}>
                  <ThemedText variant="body" color={colors.grey[50]}>
                    No districts found
                  </ThemedText>
                </View>
              }
            />
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.xs,
  },
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.grey[10],
    borderWidth: 1,
    borderColor: colors.grey[20],
    borderRadius: borderRadius.base,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    minHeight: 48,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: colors.grey[0],
    borderTopLeftRadius: borderRadius.large,
    borderTopRightRadius: borderRadius.large,
    paddingTop: spacing.base,
    height: "75%",
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.md,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.grey[10],
    borderRadius: borderRadius.rounded,
    marginHorizontal: spacing.base,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontFamily: fontFamily.body,
    fontSize: fontSize.md,
    color: colors.grey[90],
    padding: 0,
  },
  list: {
    marginTop: spacing.sm,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.grey[10],
  },
  empty: {
    padding: spacing.xl,
    alignItems: "center",
  },
})
