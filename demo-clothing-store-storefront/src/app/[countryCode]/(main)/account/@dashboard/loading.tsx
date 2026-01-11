import LoadingLogo from "@modules/common/components/loading-logo"

export default function Loading() {
  return (
    <div className="flex items-center justify-center w-full h-full min-h-[400px]">
      <LoadingLogo size="md" />
    </div>
  )
}
