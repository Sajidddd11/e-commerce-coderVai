import { useEffect } from "react"
import { Platform, StatusBar as RNStatusBar } from "react-native"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { StatusBar } from "expo-status-bar"
import * as SystemUI from "expo-system-ui"
import { Stack } from "expo-router"
import * as SplashScreen from "expo-splash-screen"
import { useFonts } from "expo-font"
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter"
import {
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
} from "@expo-google-fonts/montserrat"
import { colors } from "@design/theme"

SplashScreen.preventAutoHideAsync().catch(() => {})

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
  })

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => {})
    }
  }, [fontsLoaded, fontError])

  // Light app UI — keep status bar background/icons readable in system dark mode.
  useEffect(() => {
    SystemUI.setBackgroundColorAsync(colors.grey[0]).catch(() => {})
    if (Platform.OS === "android") {
      RNStatusBar.setBackgroundColor(colors.grey[0])
      RNStatusBar.setBarStyle("dark-content")
    }
  }, [])

  if (!fontsLoaded && !fontError) {
    return null
  }

  return (
    <GestureHandlerRootView
      style={{ flex: 1, backgroundColor: colors.grey[0] }}
    >
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.grey[0] },
            animation: "slide_from_right",
          }}
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="search"
            options={{ animation: "slide_from_bottom" }}
          />
          <Stack.Screen name="product/[handle]" />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
