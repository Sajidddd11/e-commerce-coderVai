import React, { useState, useEffect } from "react"
import { View, Text, Pressable, StyleSheet } from "react-native"
import { Input } from "@components/ui/Input"
import { colors, borderRadius, spacing } from "@design/theme"
import { fontFamily } from "@design/typography"

type AddressLabelSelectorProps = {
  value: string
  onChange: (value: string) => void
}

export function AddressLabelSelector({ value, onChange }: AddressLabelSelectorProps) {
  const [mode, setMode] = useState<"None" | "Home" | "Office" | "Custom">(
    () => {
      if (!value) return "None"
      if (value === "Home") return "Home"
      if (value === "Office") return "Office"
      return "Custom"
    }
  )

  useEffect(() => {
    if (!value && mode !== "None" && mode !== "Custom") {
      setMode("None")
    } else if (value === "Home" && mode !== "Home") {
      setMode("Home")
    } else if (value === "Office" && mode !== "Office") {
      setMode("Office")
    } else if (
      value &&
      value !== "Home" &&
      value !== "Office" &&
      mode !== "Custom"
    ) {
      setMode("Custom")
    }
  }, [value, mode])

  const handleModeChange = (newMode: "None" | "Home" | "Office" | "Custom") => {
    setMode(newMode)
    if (newMode === "Home") {
      onChange("Home")
    } else if (newMode === "Office") {
      onChange("Office")
    } else if (newMode === "None") {
      onChange("")
    } else if (newMode === "Custom") {
      if (value === "Home" || value === "Office" || !value) {
        onChange("")
      }
    }
  }

  const chips: ("None" | "Home" | "Office" | "Custom")[] = [
    "None",
    "Home",
    "Office",
    "Custom",
  ]

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Address Label (Optional)</Text>
      <View style={styles.chipsRow}>
        {chips.map((chip) => {
          const isActive = mode === chip
          return (
            <Pressable
              key={chip}
              onPress={() => handleModeChange(chip)}
              style={[styles.chip, isActive && styles.chipActive]}
            >
              <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                {chip}
              </Text>
            </Pressable>
          )
        })}
      </View>

      {mode === "Custom" && (
        <View style={styles.customWrap}>
          <Input
            label="Write custom label"
            value={value !== "Home" && value !== "Office" ? value : ""}
            onChangeText={onChange}
            placeholder="e.g. My Cousin's House"
          />
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  label: {
    fontFamily: fontFamily.interMedium,
    fontSize: 13,
    color: colors.slate[900],
    marginBottom: -2,
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: borderRadius.base,
    borderWidth: 1,
    borderColor: colors.grey[20],
    backgroundColor: "white",
  },
  chipActive: {
    backgroundColor: colors.slate[900],
    borderColor: colors.slate[900],
  },
  chipText: {
    fontFamily: fontFamily.interMedium,
    fontSize: 13,
    color: colors.slate[900],
  },
  chipTextActive: {
    color: "white",
  },
  customWrap: {
    marginTop: spacing.xs,
  },
})
