import { View, StyleSheet, Text } from "react-native"
import { useAppTheme } from "@hooks/useAppTheme"

export function AnnouncementBar() {
  const { colors } = useAppTheme();

  return (
    <View style={[styles.bar, { backgroundColor: colors.primaryMuted }]}>
      <Text style={[styles.text, { color: colors.text }]}>
        🎉 Use code <Text style={[styles.highlight, { color: colors.primary }]}>WELCOME20</Text> for 20% off your first order!
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  bar: {
    paddingHorizontal: 16, // px-4
    paddingVertical: 8, // py-2
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  text: {
    fontFamily: "Inter-Medium",
    fontWeight: "500",
    textAlign: "center",
    fontSize: 10,
    letterSpacing: 0.5, // tracking-wide roughly
  },
  highlight: {
    fontWeight: "700",
  },
})
