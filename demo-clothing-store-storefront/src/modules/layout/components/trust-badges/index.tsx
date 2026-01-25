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
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-2 md:gap-4">
          {trustBadges.map((badge) => (
            <div
              key={badge.id}
              className="grid grid-cols-3 items-center justify-center rounded-3xl p-2 lg:p-3 gap-0 lg:gap-2 transition-colors duration-200 glassmorphism-section"
            >
              <div className=" p-2 lg:p-3 w-fit mx-auto rounded-2xl flex items-center justify-center h-fit">
                <div className="scale-75 md:scale-100 text-[#56AEBF]">
                  {badge.icon}
                </div>
              </div>
              <div className="col-span-2 text-left">
                <p className="text-white text-[13px] text-left leading-tight">
                  {badge.id === "hotline" ? (
                    <a
                      href="tel:+8809677610610"
                      className="text-white text-left font-medium hover:text-gray-300 transition-colors"
                    >
                      +8809677610610
                    </a>
                  ) : (
                    badge.title
                  )}
                </p>
                <p className="text-gray-400 text-[9px] md:text-xs text-left mt-0.5 md:mt-1 leading-tight">
                  {badge.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
