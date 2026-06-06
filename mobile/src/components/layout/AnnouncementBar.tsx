import { View, StyleSheet } from "react-native"
import { colors, spacing } from "@design/theme"
import { ANNOUNCEMENT } from "@design/constants"
import { ThemedText } from "../ui/ThemedText"

export function AnnouncementBar() {
  return (
    <View style={styles.bar}>
      <ThemedText variant="bodySmall" color={colors.grey[0]} style={styles.text}>
        {ANNOUNCEMENT.message}
      </ThemedText>
    </View>
  )
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: colors.grey[90],
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base,
    alignItems: "center",
  },
  text: {
    textAlign: "center",
  },
})
