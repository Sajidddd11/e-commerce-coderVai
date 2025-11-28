"use client"

import React from "react"

interface DotSpinnerProps {
  size?: "sm" | "md" | "lg"
  color?: string
}

export default function DotSpinner({
  size = "md",
  color = "#262626",
}: DotSpinnerProps) {
  const sizeMap = {
    sm: { container: "w-8 h-8", dot: "w-1.5 h-1.5" },
    md: { container: "w-12 h-12", dot: "w-2.5 h-2.5" },
    lg: { container: "w-16 h-16", dot: "w-3 h-3" },
  }

  const { container, dot } = sizeMap[size]

  return (
    <div className={`flex items-center justify-center gap-1.5 ${container}`}>
      <style>{`
        @keyframes dotBounce {
          0%, 100% {
            opacity: 0.4;
            transform: scale(0.8);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
          }
        }
        
        .dot-1 {
          animation: dotBounce 1.4s infinite;
          animation-delay: -0.32s;
        }
        
        .dot-2 {
          animation: dotBounce 1.4s infinite;
          animation-delay: -0.16s;
        }
        
        .dot-3 {
          animation: dotBounce 1.4s infinite;
          animation-delay: 0s;
        }
      `}</style>

      {/* Dot 1 */}
      <div
        className={`dot-1 rounded-full ${dot}`}
        style={{ backgroundColor: color }}
      />

      {/* Dot 2 */}
      <div
        className={`dot-2 rounded-full ${dot}`}
        style={{ backgroundColor: color }}
      />

      {/* Dot 3 */}
      <div
        className={`dot-3 rounded-full ${dot}`}
        style={{ backgroundColor: color }}
      />
    </div>
  )
}