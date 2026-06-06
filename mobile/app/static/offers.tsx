import { StaticScreen } from "@components/layout/StaticScreen"
import { ANNOUNCEMENT } from "@design/constants"

export default function OffersScreen() {
  return (
    <StaticScreen
      title="Offers"
      variant="dark"
      intro="Save more on your favourite products with our latest promotions."
      blocks={[
        {
          heading: "Welcome Offer",
          body: `New here? Use code ${ANNOUNCEMENT.code} at checkout for 20% off your first order.`,
        },
        {
          heading: "Free Shipping",
          body: "Spend above the free shipping threshold and we'll cover your delivery — the cart will let you know how close you are.",
        },
        {
          heading: "Seasonal Drops",
          body: "Follow us on social media to be the first to know about flash sales and limited-time collections.",
        },
      ]}
    />
  )
}
