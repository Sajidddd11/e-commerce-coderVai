import { LockIcon, TruckIcon, RefundIcon, ShieldIcon, MapPinIcon, PhoneIcon, CreditCardIcon } from "@modules/common/icons/social-icons"
import Image from "next/image"

interface TrustBadge {
  id: string
  icon: React.ReactNode
  title: string
  description: string
}

const trustBadges: TrustBadge[] = [
  {
    id: "security",
    icon: <CreditCardIcon size={24} />,
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
        <div className="grid grid-cols-3 lg:grid-cols-6 gap-2 md:gap-4">
          {trustBadges.map((badge) => (
            <div
              key={badge.id}
              className="flex flex-col items-center justify-center p-2 md:p-3 rounded-lg border border-gray-700 hover:border-gray-500 transition-colors duration-200"
            >
              <div className="text-white mb-1 md:mb-2 flex items-center justify-center h-6 md:h-8">
                <div className="scale-75 md:scale-100">
                  {badge.icon}
                </div>
              </div>
              <p className="text-white font-medium text-[10px] md:text-sm text-center leading-tight">
                {badge.title}
              </p>
              <p className="text-gray-400 text-[9px] md:text-xs text-center mt-0.5 md:mt-1 leading-tight">
                {badge.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
