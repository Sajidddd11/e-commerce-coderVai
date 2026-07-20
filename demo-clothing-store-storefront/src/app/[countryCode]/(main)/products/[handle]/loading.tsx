import LoadingLogo from "@modules/common/components/loading-logo"

export default function Loading() {
    return (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-white/60 backdrop-blur-sm pointer-events-none">
            <LoadingLogo size="lg" />
        </div>
    )
}
