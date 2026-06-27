import React from "react"
import Svg, { Circle, Path, Defs, LinearGradient, Stop } from "react-native-svg"

type IconProps = {
  size?: number
}

export function CoinIcon({ size = 20 }: IconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
    >
      <Circle cx={12} cy={12} r={10} fill="url(#coinGrad)" stroke="#EAB308" strokeWidth={1.5} />
      <Circle cx={12} cy={12} r={7} stroke="#CA8A04" strokeWidth={1} strokeDasharray={[3, 2]} />
      <Path
        d="M12 7.5L13.5 10.5L17 11L14.5 13.5L15 17L12 15.5L9 17L9.5 13.5L7 11L10.5 10.5L12 7.5Z"
        fill="#CA8A04"
        stroke="#CA8A04"
        strokeWidth={0.5}
        strokeLinejoin="round"
      />
      <Defs>
        <LinearGradient id="coinGrad" x1={4} y1={4} x2={20} y2={20} gradientUnits="userSpaceOnUse">
          <Stop offset={0} stopColor="#FDE047" />
          <Stop offset={0.5} stopColor="#FACC15" />
          <Stop offset={1} stopColor="#EAB308" />
        </LinearGradient>
      </Defs>
    </Svg>
  )
}
