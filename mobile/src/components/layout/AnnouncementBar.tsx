import { View, StyleSheet, Text } from "react-native"
import { colors } from "@design/theme"

export function AnnouncementBar() {
  return (
    <View style={styles.bar}>
      <Text style={styles.text}>
        🎉 Use code <Text style={styles.highlight}>WELCOME20</Text> for 20% off your first order!
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: "rgba(86, 174, 191, 0.1)", // bg-[#56aebf]/10
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
    color: colors.slate[900],
    fontSize: 10,
    letterSpacing: 0.5, // tracking-wide roughly
  },
  highlight: {
    fontWeight: "700",
    color: colors.brand.teal,
  },
})
