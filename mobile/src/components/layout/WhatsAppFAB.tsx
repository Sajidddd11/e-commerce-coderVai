import { Pressable, StyleSheet, Linking, Platform } from "react-native"
import { MessageCircle } from "lucide-react-native"
import { colors, shadows } from "@design/theme"
import {
  WHATSAPP_NUMBER,
  WHATSAPP_DEFAULT_MESSAGE,
} from "@design/constants"

interface WhatsAppFABProps {
  bottomOffset?: number
}

export function WhatsAppFAB({ bottomOffset = 24 }: WhatsAppFABProps) {
  const open = async () => {
    const number = process.env.EXPO_PUBLIC_WHATSAPP_NUMBER || WHATSAPP_NUMBER
    const text = encodeURIComponent(WHATSAPP_DEFAULT_MESSAGE)
    const appUrl = `whatsapp://send?phone=${number}&text=${text}`
    const webUrl = `https://wa.me/${number}?text=${text}`

    const canOpen = await Linking.canOpenURL(appUrl).catch(() => false)
    Linking.openURL(canOpen ? appUrl : webUrl).catch(() => {
      Linking.openURL(webUrl)
    })
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Chat on WhatsApp"
      onPress={open}
      style={({ pressed }) => [
        styles.fab,
        shadows.lg,
        { bottom: bottomOffset, transform: [{ scale: pressed ? 0.92 : 1 }] },
      ]}
    >
      <MessageCircle
        size={26}
        color={colors.grey[0]}
        fill={Platform.OS === "ios" ? undefined : colors.grey[0]}
      />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.whatsapp,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 50,
  },
})
