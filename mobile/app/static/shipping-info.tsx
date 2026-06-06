import { StaticScreen } from "@components/layout/StaticScreen"

export default function ShippingInfoScreen() {
  return (
    <StaticScreen
      title="Shipping Information"
      intro="We deliver nationwide across Bangladesh with reliable courier partners."
      blocks={[
        {
          heading: "Delivery Charges",
          body: "Inside Dhaka metro: ৳80. Outside Dhaka: ৳130. Store pickup is free. Charges are shown at checkout based on your district.",
        },
        {
          heading: "Delivery Time",
          body: "Inside Dhaka: 1–3 business days. Outside Dhaka: 3–5 business days. Orders are dispatched the same day when placed before our daily cut-off.",
        },
        {
          heading: "Order Tracking",
          body: "You'll receive an SMS confirmation when your order is placed and updates as it progresses. For tracking help, contact us on WhatsApp with your order number.",
        },
        {
          heading: "Store Pickup",
          body: "Prefer to collect in person? Choose 'Store pickup' at checkout to skip delivery charges.",
        },
      ]}
    />
  )
}
