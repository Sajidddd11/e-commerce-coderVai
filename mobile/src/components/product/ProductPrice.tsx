import { View, StyleSheet } from "react-native"
import { HttpTypes } from "@medusajs/types"
import { getProductPrice } from "@utils/get-product-price"
import { ThemedText } from "../ui/ThemedText"
import { colors, spacing } from "@design/theme"
import { fontFamily, fontSize } from "@design/typography"

interface ProductPriceProps {
  product: HttpTypes.StoreProduct
  variantId?: string
  size?: "sm" | "lg"
  /** Tighter card layout — no duplicate % label (badge on image). */
  compact?: boolean
}

export function ProductPrice({
  product,
  variantId,
  size = "sm",
  compact = false,
}: ProductPriceProps) {
  const { cheapestPrice, variantPrice } = getProductPrice({ product, variantId })
  const price = variantId ? variantPrice : cheapestPrice

  if (!price) {
    return (
      <ThemedText variant="bodySmall" color={colors.grey[50]}>
        Price unavailable
      </ThemedText>
    )
  }

  const onSale =
    price.price_type === "sale" &&
    price.original_price_number > price.calculated_price_number

  if (compact) {
    return (
      <View style={styles.compactRow}>
        <ThemedText
          variant="bodyMedium"
          color={onSale ? colors.sale : colors.grey[90]}
          style={styles.compactPrice}
        >
          {price.calculated_price}
        </ThemedText>
        {onSale ? (
          <ThemedText
            variant="bodySmall"
            color={colors.grey[50]}
            style={styles.strike}
          >
            {price.original_price}
          </ThemedText>
        ) : null}
      </View>
    )
  }

  return (
    <View style={styles.row}>
      <ThemedText
        variant="productPrice"
        color={onSale ? colors.sale : colors.grey[90]}
        style={size === "lg" ? styles.lg : undefined}
      >
        {price.calculated_price}
      </ThemedText>

      {onSale ? (
        <>
          <ThemedText
            variant="bodySmall"
            color={colors.grey[50]}
            style={styles.strike}
          >
            {price.original_price}
          </ThemedText>
          <ThemedText variant="bodySmall" color={colors.sale}>
            -{price.percentage_diff}%
          </ThemedText>
        </>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  compactRow: {
    flexDirection: "row",
    alignItems: "baseline",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  compactPrice: {
    fontFamily: fontFamily.button,
    fontSize: fontSize.base,
    fontWeight: "700",
  },
  lg: {
    fontSize: 24,
  },
  strike: {
    textDecorationLine: "line-through",
  },
})
