import React from "react"
import "./loading-logo.css"

interface LoadingLogoProps {
    size?: "sm" | "md" | "lg"
}

const LoadingLogo: React.FC<LoadingLogoProps> = ({ size = "md" }) => {
    const sizeClasses = {
        sm: "w-12 h-12 md:w-16 md:h-16",
        md: "w-16 h-16 md:w-24 md:h-24",
        lg: "w-20 h-20 md:w-32 md:h-32",
    }

    return (
        <div className="loading-logo-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
            <div className={`loading-logo ${sizeClasses[size]}`} style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg
                    id="Layer_1"
                    xmlns="http://www.w3.org/2000/svg"
                    version="1.1"
                    viewBox="0 0 375 375"
                    className="logo-svg"
                >
                    <defs>
                        {/* Mask to clip reflection inside logo only */}
                        <mask id="logoMask">
                            <rect width="375" height="375" fill="black" />
                            <g fill="white">
                                <path d="M357,18l-186.26,152.62L18,357l186.26-152.62L357,18ZM258,29.5l-103.5,69.87-70,103.62,103.51-69.86,69.99-103.63ZM117,345.25l104.39-70.24,66.17-98.08,3.94-6.18-104.26,70.11-70.24,104.38Z" />
                                <polygon points="357 18 204.26 204.38 18 357 170.74 170.62 357 18" />
                                <polygon points="117 345.25 187.24 240.86 291.5 170.75 287.56 176.93 221.39 275.01 117 345.25" />
                                <polygon points="258 29.5 188.01 133.13 84.5 203 154.5 99.38 258 29.5" />
                            </g>
                        </mask>

                        {/* Radial gradient for ultra-soft oval flare */}
                        <radialGradient id="bladeGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.85)" />
                            <stop offset="20%" stopColor="rgba(255, 255, 255, 0.6)" />
                            <stop offset="40%" stopColor="rgba(255, 255, 255, 0.35)" />
                            <stop offset="60%" stopColor="rgba(255, 255, 255, 0.15)" />
                            <stop offset="80%" stopColor="rgba(255, 255, 255, 0.05)" />
                            <stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
                        </radialGradient>
                    </defs>

                    {/* Base black logo */}
                    <g className="logo-paths">
                        <path
                            className="logo-path"
                            d="M357,18l-186.26,152.62L18,357l186.26-152.62L357,18ZM258,29.5l-103.5,69.87-70,103.62,103.51-69.86,69.99-103.63ZM117,345.25l104.39-70.24,66.17-98.08,3.94-6.18-104.26,70.11-70.24,104.38Z"
                        />
                        <polygon
                            className="logo-path"
                            points="357 18 204.26 204.38 18 357 170.74 170.62 357 18"
                        />
                        <polygon
                            className="logo-path"
                            points="117 345.25 187.24 240.86 291.5 170.75 287.56 176.93 221.39 275.01 117 345.25"
                        />
                        <polygon
                            className="logo-path"
                            points="258 29.5 188.01 133.13 84.5 203 154.5 99.38 258 29.5"
                        />
                    </g>

                    {/* Soft oval flare - masked to logo */}
                    <g mask="url(#logoMask)">
                        <ellipse
                            className="reflection-line"
                            cx="187.5"
                            cy="187.5"
                            rx="80"
                            ry="600"
                            fill="url(#bladeGradient)"
                            style={{ transformOrigin: '187.5px 187.5px' }}
                        />
                    </g>
                </svg>
            </div>
        </div>
    )
}

export default LoadingLogo
