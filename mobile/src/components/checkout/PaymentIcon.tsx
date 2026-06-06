import { Banknote, CreditCard, Smartphone, Wallet } from "lucide-react-native"
import { colors } from "@design/theme"

/** Maps a payment provider id (incl. virtual bKash/Nagad) to a Lucide icon. */
export function PaymentIcon({
  providerId,
  size = 22,
}: {
  providerId: string
  size?: number
}) {
  if (providerId === "pp_system_default") {
    return <Banknote size={size} color={colors.success} />
  }
  if (providerId === "pp_sslcommerz_default_bkash") {
    return <Smartphone size={size} color="#E2136E" />
  }
  if (providerId === "pp_sslcommerz_default_nagad") {
    return <Wallet size={size} color="#EC1C24" />
  }
  return <CreditCard size={size} color={colors.brand.teal} />
}
