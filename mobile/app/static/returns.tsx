import { StaticScreen } from "@components/layout/StaticScreen"

export default function ReturnsScreen() {
  return (
    <StaticScreen
      title="Returns & Refunds"
      intro="We want you to love your purchase. If something isn't right, here's how returns work."
      blocks={[
        {
          heading: "Return Window",
          body: "Items can be returned within 7 days of delivery, provided they are unused, in original condition, and with all tags and packaging intact.",
        },
        {
          heading: "How to Request a Return",
          body: "Contact our support team via WhatsApp or phone with your order number. We'll guide you through the pickup or drop-off process.",
        },
        {
          heading: "Refunds",
          body: "Once we receive and inspect your return, approved refunds are processed to your original payment method or via bKash/Nagad for Cash on Delivery orders.",
        },
        {
          heading: "Non-Returnable Items",
          body: "For hygiene and safety reasons, certain items such as innerwear, cosmetics, and personal care products are not eligible for return.",
        },
      ]}
    />
  )
}
