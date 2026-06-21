import { useEffect, useState } from "react"
import { View, Pressable, StyleSheet, Text } from "react-native"
import Animated, { useAnimatedStyle, interpolate, Extrapolation, SharedValue, interpolateColor } from "react-native-reanimated"
import { useRouter } from "expo-router"
import { MapPin, ChevronDown, Bell } from "lucide-react-native"
import * as Location from "expo-location"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { colors } from "@design/theme"
import { fontFamily, fontSize } from "@design/typography"
import { ProductSearchBar } from "@components/search/ProductSearchBar"

interface HeaderProps {
  showSearch?: boolean
  scrollY?: SharedValue<number>
  searchValue?: string
  onChangeSearch?: (text: string) => void
  onSubmitSearch?: (term: string) => void
  onPressFilter?: () => void
}

export function Header({
  showSearch = true,
  scrollY,
  searchValue = "",
  onChangeSearch = () => {},
  onSubmitSearch = () => {},
  onPressFilter,
}: HeaderProps) {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const [locationName, setLocationName] = useState("Locating...")

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== "granted") {
        setLocationName("Dhaka, Bangladesh")
        return
      }

      try {
        let location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        })
        let reverseGeocode = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        })

        if (reverseGeocode.length > 0) {
          const place = reverseGeocode[0]
          const city = place.city || place.subregion || place.region
          const country = place.country
          if (city && country) {
            setLocationName(`${city}, ${country}`)
          } else {
            setLocationName(place.name || "Unknown Location")
          }
        } else {
          setLocationName("Unknown Location")
        }
      } catch (e) {
        setLocationName("Location Error")
      }
    })()
  }, [])

  const headerAnimatedStyle = useAnimatedStyle(() => {
    const value = scrollY?.value || 0
    const backgroundColor = interpolateColor(value, [0, 50], [colors.brand.teal, colors.grey[0]])
    const borderBottomLeftRadius = interpolate(value, [0, 50], [24, 0], Extrapolation.CLAMP)
    const paddingBottom = interpolate(value, [0, 50], [24, 12], Extrapolation.CLAMP)
    const borderBottomWidth = interpolate(value, [0, 50], [0, 1], Extrapolation.CLAMP)

    return {
      backgroundColor,
      borderBottomLeftRadius,
      borderBottomRightRadius: borderBottomLeftRadius,
      paddingBottom,
      borderBottomWidth,
      borderBottomColor: "#E5E7EB",
    }
  })

  const topRowStyle = useAnimatedStyle(() => {
    const value = scrollY?.value || 0
    const height = interpolate(value, [0, 50], [40, 0], Extrapolation.CLAMP)
    const opacity = interpolate(value, [0, 30], [1, 0], Extrapolation.CLAMP)
    const marginBottom = interpolate(value, [0, 50], [20, 0], Extrapolation.CLAMP)

    return {
      height,
      opacity,
      marginBottom,
      overflow: "hidden",
    }
  })

  const searchFieldAnimatedStyle = useAnimatedStyle(() => {
    const value = scrollY?.value || 0
    // Fade in a grey border as the header background becomes white
    const borderColor = interpolateColor(value, [20, 50], ["transparent", "#E5E7EB"])
    return {
      borderWidth: 2,
      borderColor,
    }
  })

  return (
    <Animated.View style={[styles.header, { paddingTop: insets.top + 12 }, headerAnimatedStyle]}>
      {/* Top Bar: Location & Notifications */}
      <Animated.View style={[styles.topRow, topRowStyle]}>
        <View>
          <Text style={styles.locationLabel}>Location</Text>
          <View style={styles.locationValueRow}>
            <MapPin size={14} color="white" />
            <Text style={styles.locationValue}>{locationName}</Text>
            <ChevronDown size={14} color="white" />
          </View>
        </View>

        <Pressable style={styles.notificationBtn}>
          <Bell size={20} color="white" />
          <View style={styles.notificationBadge} />
        </Pressable>
      </Animated.View>

      {/* Unified Search Bar */}
      {showSearch ? (
        <ProductSearchBar
          value={searchValue}
          onChangeText={onChangeSearch}
          onSubmit={onSubmitSearch}
          onPressFilter={onPressFilter}
          containerStyle={searchFieldAnimatedStyle}
        />
      ) : null}
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    zIndex: 10,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  locationLabel: {
    fontFamily: fontFamily.interRegular,
    fontSize: fontSize.xs,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 4,
  },
  locationValueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  locationValue: {
    fontFamily: fontFamily.interBold,
    fontSize: fontSize.sm,
    color: "white",
  },
  notificationBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  notificationBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.sale,
    borderWidth: 1,
    borderColor: colors.brand.teal,
  },
})
