import { View, StyleSheet, Text } from "react-native"
import Animated, { useAnimatedStyle, interpolate, Extrapolation, SharedValue } from "react-native-reanimated"
import { colors, spacing } from "@design/theme"

interface AnnouncementBarProps {
  scrollY?: SharedValue<number>
}

export function AnnouncementBar({ scrollY }: AnnouncementBarProps) {
  const fillerStyle = useAnimatedStyle(() => {
    // Fade out the corner filler when pulling down so the banner doesn't look 'fat'
    const opacity = interpolate(scrollY?.value || 0, [-20, 0], [0, 1], Extrapolation.CLAMP)
    return { opacity }
  })

  const barStyle = useAnimatedStyle(() => {
    // Curve bottom corners when connected, make sharp when disconnected
    const radius = interpolate(scrollY?.value || 0, [-20, 0], [0, 24], Extrapolation.CLAMP)
    return {
      borderBottomLeftRadius: radius,
      borderBottomRightRadius: radius,
    }
  })

  return (
    <View style={styles.container}>
      {/* Absolute filler to sit behind the Header's curved corners */}
      <Animated.View style={[styles.filler, fillerStyle]} />
      
      <Animated.View style={[styles.bar, barStyle]}>
        <Text style={styles.text}>
          🎉 Use code <Text style={styles.highlight}>WELCOME20</Text> for 20% off your first order!
        </Text>
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  filler: {
    position: "absolute",
    top: -24,
    left: 0,
    right: 0,
    height: 24,
    backgroundColor: "rgba(86, 174, 191, 0.1)",
  },
  bar: {
    backgroundColor: "rgba(86, 174, 191, 0.1)", // bg-[#56aebf]/10
    paddingHorizontal: spacing.md, // px-4
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
