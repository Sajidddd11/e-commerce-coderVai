import { LockIcon, TruckIcon, RefundIcon, ShieldIcon, MapPinIcon, PhoneIcon } from "@modules/common/icons/social-icons"

interface TrustBadge {
  id: string
  icon: React.ReactNode
  title: string
  description: string
}

const trustBadges: TrustBadge[] = [
  {
    id: "security",
    icon: <LockIcon size={24} />,
    title: "Secure Payment",
    description: "SSL Secured"
  },
  {
    id: "delivery",
    icon: <TruckIcon size={24} />,
    title: "Fast Delivery",
    description: "Nationwide"
  },
  {
    id: "returns",
    icon: <RefundIcon size={24} />,
    title: "Easy Returns",
    description: "7 Days Return"
  },
  {
    id: "protection",
    icon: <ShieldIcon size={24} />,
    title: "Data Security",
    description: "100% Safe"
  },
  {
    id: "address",
    icon: <MapPinIcon size={24} />,
    title: "Headquarters",
    description: "Dhaka, BD"
  },
  {
    id: "hotline",
    icon: <PhoneIcon size={24} />,
    title: "24/7 Support",
    description: "Hotline Available"
  }
]

export default function TrustBadges() {
  return (
    <div className="w-full border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
          {trustBadges.map((badge) => (
            <div
              key={badge.id}
              className="flex flex-col items-center justify-center p-4 rounded-lg bg-gray-900 hover:bg-gray-800 transition-colors duration-200"
            >
              <div className="text-white mb-2">
                {badge.icon}
              </div>
              <p className="text-white font-medium text-xs md:text-sm text-center">
                {badge.title}
              </p>
              <p className="text-gray-400 text-xs text-center mt-1">
                {badge.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
