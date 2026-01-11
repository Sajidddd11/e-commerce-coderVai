import LoadingLogo from "@modules/common/components/loading-logo"

export default function LoadingDemo() {
    return (
        <div className="min-h-screen bg-white">
            {/* Light Background Demo */}
            <div className="py-16 bg-white">
                <h2 className="text-center text-2xl font-bold mb-8">
                    Light Background
                </h2>
                <LoadingLogo size="lg" />
            </div>

            {/* Dark Background Demo */}
            <div className="py-16 bg-gray-900">
                <h2 className="text-center text-2xl font-bold mb-8 text-white">
                    Dark Background
                </h2>
                <div className="dark">
                    <LoadingLogo size="lg" />
                </div>
            </div>

            {/* Different Sizes */}
            <div className="py-16 bg-gray-100">
                <h2 className="text-center text-2xl font-bold mb-8">
                    Different Sizes
                </h2>
                <div className="flex items-center justify-center gap-8">
                    <div>
                        <p className="text-center mb-4 text-sm">Small</p>
                        <LoadingLogo size="sm" />
                    </div>
                    <div>
                        <p className="text-center mb-4 text-sm">Medium</p>
                        <LoadingLogo size="md" />
                    </div>
                    <div>
                        <p className="text-center mb-4 text-sm">Large</p>
                        <LoadingLogo size="lg" />
                    </div>
                </div>
            </div>
        </div>
    )
}
