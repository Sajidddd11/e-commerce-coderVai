import { StaticScreen } from "@components/layout/StaticScreen"

export default function AboutScreen() {
  return (
    <StaticScreen
      title="About Us"
      variant="dark"
      intro="ZAHAN Fashion and Lifestyle brings carefully curated products to customers across Bangladesh — blending quality, value, and modern design."
      blocks={[
        {
          heading: "Our Story",
          body: "Founded with a passion for elevating everyday style, ZAHAN curates fashion and lifestyle products that combine quality craftsmanship with accessible pricing. We believe great design should be within everyone's reach.",
        },
        {
          heading: "What We Stand For",
          body: "Authenticity, fair pricing, and dependable service. Every product is selected with care, and every order is handled with the attention it deserves.",
        },
        {
          heading: "Nationwide Delivery",
          body: "From Dhaka to every district, we deliver across Bangladesh with secure payment options including Cash on Delivery, bKash, Nagad, and cards via SSLCommerz.",
        },
      ]}
    />
  )
}
