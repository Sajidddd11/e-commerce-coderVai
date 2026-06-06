import { View, StyleSheet, Text } from "react-native"
import { HttpTypes } from "@medusajs/types"
import { getProductPrice } from "@utils/get-product-price"
import { colors } from "@design/theme"
import { fontFamily, fontSize } from "@design/typography"

interface ProductPriceProps {
  product: HttpTypes.StoreProduct
  variantId?: string
  size?: "sm" | "lg"
  compact?: boolean
  color?: string
}

export function ProductPrice({
  product,
  variantId,
  size = "sm",
  compact = false,
  color,
}: ProductPriceProps) {
  const { cheapestPrice, variantPrice } = getProductPrice({ product, variantId })
  const price = variantId ? variantPrice : cheapestPrice

  if (!price) {
    return (
      <Text style={styles.unavailable}>
        Price unavailable
      </Text>
    )
  }

  const onSale =
    price.price_type === "sale" &&
    price.original_price_number > price.calculated_price_number

  if (compact) {
    return (
      <View style={styles.compactRow}>
        <Text
          numberOfLines={1}
          style={[
            styles.compactPrice,
            { color: onSale ? "#EF4444" : "#111827" }
          ]}
        >
          {price.calculated_price}
        </Text>
      </View>
    )
  }

  return (
    <View style={styles.row}>
      <Text
        style={[
          styles.price,
          size === "lg" ? styles.lg : undefined,
          { color: onSale ? "#EF4444" : color || "#111827" }
        ]}
      >
        {price.calculated_price}
      </Text>

      {onSale ? (
        <>
          <Text style={[styles.strike, size === "lg" ? styles.strikeLg : undefined]}>
            {price.original_price}
          </Text>
          {size === "lg" ? (
            <View style={styles.saleBadgeLg}>
              <Text style={styles.saleBadgeTextLg}>
                {price.percentage_diff}% off
              </Text>
            </View>
          ) : (
            <Text style={styles.salePct}>
              -{price.percentage_diff}%
            </Text>
          )}
        </>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  unavailable: {
    color: "#6B7280", // text-gray-500
    fontSize: fontSize[13],
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8, // gap-2
  },
  compactRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6, // gap-1.5
  },
  compactPrice: {
    fontFamily: fontFamily.interBold,
    fontSize: fontSize.sm, // increased from 13 to 14
  },
  compactStrike: {
    fontFamily: fontFamily.interRegular,
    fontSize: fontSize[11], // text-[11px]
    color: "#9CA3AF", // text-gray-400 ish
    textDecorationLine: "line-through",
  },
  price: {
    fontFamily: fontFamily.interBold,
    fontSize: fontSize.md, // 16px
  },
  lg: {
    fontSize: fontSize.xl, // text-xl (20px)
  },
  strike: {
    fontFamily: fontFamily.interRegular,
    fontSize: fontSize.sm, // 14px
    color: "#9CA3AF",
    textDecorationLine: "line-through",
  },
  strikeLg: {
    color: "#6B7280", // text-gray-500
  },
  salePct: {
    fontFamily: fontFamily.interSemiBold,
    fontSize: fontSize.sm,
    color: "#EF4444",
  },
  saleBadgeLg: {
    backgroundColor: "#EF4444", // bg-red-500
    borderRadius: 9999, // rounded-full
    paddingHorizontal: 8, // px-2
    paddingVertical: 2, // py-0.5
  },
  saleBadgeTextLg: {
    fontFamily: fontFamily.interSemiBold,
    fontSize: fontSize[11], // text-[11px]
    color: "white",
  },
})
