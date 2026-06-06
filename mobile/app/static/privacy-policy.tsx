import { StaticScreen } from "@components/layout/StaticScreen"

export default function PrivacyPolicyScreen() {
  return (
    <StaticScreen
      title="Privacy Policy"
      intro="Your privacy matters to us. This policy explains what information we collect and how we use it."
      blocks={[
        {
          heading: "Information We Collect",
          body: "We collect the details you provide when creating an account or placing an order — your name, phone number, email, and delivery address — to fulfil and support your purchases.",
        },
        {
          heading: "How We Use It",
          body: "Your information is used to process orders, arrange delivery, send order updates by SMS, and provide customer support. We do not sell your personal data.",
        },
        {
          heading: "Payments",
          body: "Card and mobile-banking payments are handled securely by SSLCommerz. We never store your full card details on our servers.",
        },
        {
          heading: "Your Choices",
          body: "You can update your profile and saved addresses at any time from your account, or contact us to request deletion of your data.",
        },
      ]}
    />
  )
}
