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
                                <path d="M257.73,348.6V24.24h64.12c15.38,0,36.96,20.94,36.8,37.12l-.23,255.92c-10.14,46.66-65.92,30.74-100.69,31.32Z" />
                                <path d="M51.8,350.11c-15.63-2.1-38.15-19.87-32.51-37.05,25.4-22.83,49.24-47.32,73.98-70.84,32.11-30.53,65.73-60.01,97.37-91.21,16.21-15.99,30.54-34.11,48.22-48.33l-1.49,247.44H51.8Z" />
                                <path d="M238.12,24.24l1.52,63.37c-40.36,2.89-66.81-4.74-99.6,23.36-24.67,21.14-48.43,47.11-72.37,69.44-16.77,15.64-34.11,30.86-51.32,45.99V58.18c0-14.09,23.12-33.95,36.96-33.95h184.81Z" />
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
                            d="M257.73,348.6V24.24h64.12c15.38,0,36.96,20.94,36.8,37.12l-.23,255.92c-10.14,46.66-65.92,30.74-100.69,31.32Z"
                        />
                        <path
                            className="logo-path"
                            d="M51.8,350.11c-15.63-2.1-38.15-19.87-32.51-37.05,25.4-22.83,49.24-47.32,73.98-70.84,32.11-30.53,65.73-60.01,97.37-91.21,16.21-15.99,30.54-34.11,48.22-48.33l-1.49,247.44H51.8Z"
                        />
                        <path
                            className="logo-path"
                            d="M238.12,24.24l1.52,63.37c-40.36,2.89-66.81-4.74-99.6,23.36-24.67,21.14-48.43,47.11-72.37,69.44-16.77,15.64-34.11,30.86-51.32,45.99V58.18c0-14.09,23.12-33.95,36.96-33.95h184.81Z"
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
