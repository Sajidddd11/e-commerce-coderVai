import { StaticScreen } from "@components/layout/StaticScreen"

export default function TermsOfServiceScreen() {
  return (
    <StaticScreen
      title="Terms of Service"
      intro="By using the ZAHAN app and placing orders, you agree to the following terms."
      blocks={[
        {
          heading: "Orders & Pricing",
          body: "All prices are listed in Bangladeshi Taka (৳) and are subject to change. We reserve the right to cancel orders in cases of pricing errors or stock unavailability.",
        },
        {
          heading: "Payments",
          body: "We accept Cash on Delivery, bKash, Nagad, and cards via SSLCommerz. Orders are confirmed once payment is authorised or, for COD, once the order is placed.",
        },
        {
          heading: "Accounts",
          body: "You are responsible for keeping your account credentials secure. Notify us immediately if you suspect unauthorised use.",
        },
        {
          heading: "Limitation of Liability",
          body: "ZAHAN is not liable for delays caused by courier partners or events beyond our reasonable control. Our liability is limited to the value of the affected order.",
        },
      ]}
    />
  )
}
