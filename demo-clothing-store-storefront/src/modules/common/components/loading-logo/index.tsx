import React from "react"
import "./loading-logo.css"

interface LoadingLogoProps {
    size?: "sm" | "md" | "lg"
}

const LoadingLogo: React.FC<LoadingLogoProps> = ({ size = "md" }) => {
    const sizeClasses = {
        sm: "w-16 h-16",
        md: "w-24 h-24",
        lg: "w-32 h-32",
    }

    return (
        <div className="loading-logo-container">
            <div className={`loading-logo ${sizeClasses[size]}`}>
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

                        {/* Gradient for bright blade flare - wider and more feathered */}
                        <linearGradient id="bladeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="rgba(255, 255, 255, 0)" />
                            <stop offset="10%" stopColor="rgba(255, 255, 255, 0.2)" />
                            <stop offset="30%" stopColor="rgba(255, 255, 255, 0.6)" />
                            <stop offset="50%" stopColor="rgba(255, 255, 255, 1)" />
                            <stop offset="70%" stopColor="rgba(255, 255, 255, 0.6)" />
                            <stop offset="90%" stopColor="rgba(255, 255, 255, 0.2)" />
                            <stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
                        </linearGradient>
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

                    {/* Single reflection line - masked to only show inside logo */}
                    <g mask="url(#logoMask)">
                        <rect
                            className="reflection-line"
                            x="157.5"
                            y="-300"
                            width="60"
                            height="975"
                            fill="url(#bladeGradient)"
                            transform-origin="187.5 187.5"
                        />
                    </g>
                </svg>
            </div>
        </div>
    )
}

export default LoadingLogo
