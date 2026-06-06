import { Banknote, CreditCard } from "lucide-react-native"
import { Image } from "expo-image"
import { useAppTheme } from "@hooks/useAppTheme"

/** Maps a payment provider id (incl. virtual bKash/Nagad) to a Lucide icon or SVG asset. */
export function PaymentIcon({
  providerId,
  size = 22,
}: {
  providerId: string
  size?: number
}) {
  const { colors } = useAppTheme();

  if (providerId === "pp_system_default") {
    return <Banknote size={size} color={colors.success} />
  }
  if (providerId === "pp_sslcommerz_default_bkash") {
    return (
      <Image
        source={require("../../../assets/icons/SVG/bkash.svg")}
        style={{ width: size, height: size }}
        contentFit="contain"
      />
    )
  }
  if (providerId === "pp_sslcommerz_default_nagad") {
    return (
      <Image
        source={require("../../../assets/icons/SVG/nagad.svg")}
        style={{ width: size, height: size }}
        contentFit="contain"
      />
    )
  }
  return <CreditCard size={size} color={colors.primary} />
}

