import React from "react"

type IconProps = {
  className?: string
  size?: number
}

const Coin: React.FC<IconProps> = ({ className, size = 20 }) => {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" r="10" fill="url(#coinGrad)" stroke="#EAB308" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="7" stroke="#CA8A04" strokeWidth="1" strokeDasharray="3 2" />
      <path
        d="M12 7.5L13.5 10.5L17 11L14.5 13.5L15 17L12 15.5L9 17L9.5 13.5L7 11L10.5 10.5L12 7.5Z"
        fill="#CA8A04"
        stroke="#CA8A04"
        strokeWidth="0.5"
        strokeLinejoin="round"
      />
      <defs>
        <linearGradient id="coinGrad" x1="4" y1="4" x2="20" y2="20" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FDE047" />
          <stop offset="0.5" stopColor="#FACC15" />
          <stop offset="1" stopColor="#EAB308" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export default Coin
