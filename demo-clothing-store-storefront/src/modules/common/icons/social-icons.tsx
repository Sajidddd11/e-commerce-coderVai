import { IconProps } from "../../../types/icon"
import Image from "next/image"

export const FacebookIcon = ({
  size = 24,
  ...props
}: IconProps) => {
  const iconSize = typeof size === 'string' ? parseInt(size) : size
  return (
    <Image
      src="/fbz.png"
      alt="Facebook"
      width={iconSize}
      height={iconSize}
      {...props}
    />
  )
}

export const InstagramIcon = ({
  size = 24,
  ...props
}: IconProps) => {
  const iconSize = typeof size === 'string' ? parseInt(size) : size
  return (
    <Image
      src="/instaz.png"
      alt="Instagram"
      width={iconSize}
      height={iconSize}
      {...props}
    />
  )
}

export const YouTubeIcon = ({
  size = 24,
  ...props
}: IconProps) => {
  const iconSize = typeof size === 'string' ? parseInt(size) : size
  return (
    <Image
      src="/youtubez.png"
      alt="YouTube"
      width={iconSize}
      height={iconSize}
      {...props}
    />
  )
}

export const MailIcon = ({
  color = "currentColor",
  size = 24,
  ...props
}: IconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7" />
      <rect x="2" y="4" width="20" height="16" rx="2" />
    </svg>
  )
}

export const PhoneIcon = ({
  color = "currentColor",
  size = 24,
  ...props
}: IconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      stroke="none"
      {...props}
    >
      <path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384" />
    </svg>
  )
}

export const LockIcon = ({
  color = "currentColor",
  size = 24,
  ...props
}: IconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}

export const SmileIcon = ({
  color = "currentColor",
  size = 24,
  ...props
}: IconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M8 14s1.5 2 4 2 4-2 4-2" />
      <line x1="9" x2="9.01" y1="9" y2="9" />
      <line x1="15" x2="15.01" y1="9" y2="9" />
    </svg>
  )
}

export const ElectricTruckIcon = ({
  color = "currentColor",
  size = 24,
  ...props
}: IconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M14 19V7a2 2 0 0 0-2-2H9" />
      <path d="M15 19H9" />
      <path d="M19 19h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62L18.3 9.38a1 1 0 0 0-.78-.38H14" />
      <path d="M2 13v5a1 1 0 0 0 1 1h2" />
      <path d="M4 3 2.15 5.15a.495.495 0 0 0 .35.86h2.15a.47.47 0 0 1 .35.86L3 9.02" />
      <circle cx="17" cy="19" r="2" />
      <circle cx="7" cy="19" r="2" />
    </svg>
  )
}

export const TikTokIcon = ({
  size = 24,
  ...props
}: IconProps) => {
  const iconSize = typeof size === 'string' ? parseInt(size) : size
  return (
    <Image
      src="/tiktokz.png"
      alt="TikTok"
      width={iconSize}
      height={iconSize}
      {...props}
    />
  )
}

export const WhatsAppIcon = ({
  color = "currentColor",
  size = 24,
  ...props
}: IconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      {...props}
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

export const TruckIcon = ({
  color = "currentColor",
  size = 24,
  ...props
}: IconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
      <circle cx="7" cy="18" r="2" />
      <path d="M15 18H9" />
      <path d="M21 14h-4a2 2 0 0 0-2 2v2" />
      <circle cx="17" cy="18" r="2" />
      <path d="M6 12H4" />
      <path d="M6 8H4" />
    </svg>
  )
}

export const RefundIcon = ({
  color = "currentColor",
  size = 24,
  ...props
}: IconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <polyline points="21 15 16 10 21 5" />
      <path d="M21 5H9a7 7 0 0 0 0 14h12" />
    </svg>
  )
}

export const ShieldIcon = ({
  color = "currentColor",
  size = 24,
  ...props
}: IconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  )
}

export const MapPinIcon = ({
  color = "currentColor",
  size = 24,
  ...props
}: IconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

export const CreditCardIcon = ({
  color = "currentColor",
  size = 24,
  ...props
}: IconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <line x1="2" x2="22" y1="10" y2="10" />
    </svg>
  )
}

export const SecurePaymentIcon = () => {
  return (
    <div className="inline-flex flex-col items-center justify-center p-6 md:p-8 border border-gray-700 rounded-xl bg-gradient-to-br from-gray-900 to-black hover:border-gray-600 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10">
      {/* Payment Cards Icon */}
      <div className="mb-3">
        <svg
          width="120"
          height="32"
          viewBox="0 0 120 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-lg"
        >
          {/* Multiple credit cards stacked */}
          {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <rect
              key={i}
              x={i * 12}
              y="4"
              width="24"
              height="16"
              rx="2"
              fill={i % 3 === 0 ? '#3b82f6' : i % 3 === 1 ? '#8b5cf6' : '#ec4899'}
              opacity="0.9"
            />
          ))}
          {/* Checkmark overlay */}
          <circle cx="110" cy="12" r="8" fill="#10b981" />
          <path
            d="M107 12l2 2 4-4"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Text Content */}
      <div className="text-center">
        <h3 className="text-white font-bold text-base md:text-lg mb-1">
          Secure Payment
        </h3>
        <div className="flex items-center gap-1.5 text-gray-400 text-xs md:text-sm">
          <LockIcon size={14} color="#10b981" />
          <span className="font-medium text-green-400">SSL Secured</span>
        </div>
      </div>
    </div>
  )
}
