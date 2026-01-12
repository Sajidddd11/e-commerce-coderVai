import { Text, clx } from "@medusajs/ui"
import { VariantPrice } from "types/global"
import ResponsivePrice from "@modules/common/components/responsive-price"

export default function PreviewPrice({ price }: { price: VariantPrice }) {
  if (!price) {
    return null
  }

  return (
    <>
      {price.price_type === "sale" && (
        <Text
          className="line-through text-ui-fg-muted"
          data-testid="original-price"
        >
          {price.original_price}
        </Text>
      )}
      <div
        className={clx("text-ui-fg-muted", {
          "text-ui-fg-interactive": price.price_type === "sale",
        })}
        data-testid="price"
      >
        <ResponsivePrice
          formattedPrice={price.calculated_price}
          baseClassName="text-sm small:text-base font-medium"
        />
      </div>
    </>
  )
}
