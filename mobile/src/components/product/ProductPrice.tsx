import { View, StyleSheet } from "react-native"
import { HttpTypes } from "@medusajs/types"
import { getProductPrice } from "@utils/get-product-price"
import { ThemedText } from "../ui/ThemedText"
import { colors, spacing } from "@design/theme"

interface ProductPriceProps {
  product: HttpTypes.StoreProduct
  variantId?: string
  size?: "sm" | "lg"
}

export function ProductPrice({
  product,
  variantId,
  size = "sm",
}: ProductPriceProps) {
  const { cheapestPrice, variantPrice } = getProductPrice({ product, variantId })
  const price = variantId ? variantPrice : cheapestPrice

  if (!price) return null

  const onSale =
    price.price_type === "sale" &&
    price.original_price_number > price.calculated_price_number

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
  lg: {
    fontSize: 24,
  },
  strike: {
    textDecorationLine: "line-through",
  },
})
