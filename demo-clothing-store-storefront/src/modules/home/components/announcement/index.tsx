export default function Announcement() {
  return (
    <div className="w-full bg-gradient-to-r from-gray-900 via-black to-gray-900 border-b border-gray-800">
      <div className="content-container">
        <div className="flex flex-col items-center justify-center py-4 small:py-3 gap-2 px-0">
          <div className="text-center">
            <p className="text-xs xsmall:text-sm small:text-base text-white font-bold">
              🎉 Exclusive Launch Offer
            </p>
            <p className="text-xs text-gray-100 mt-0.5 small:mt-1 font-semibold">
              Get 20% off on your first purchase with code: <span className="font-bold text-cyan-400">WELCOME20</span>
            </p>
          </div>
          <div className="flex items-center gap-2 text-gray-100 hover:text-white transition-colors cursor-pointer group">
            <span className="text-xs small:text-sm font-bold">Shop Now</span>
            <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
          </div>
        </div>
      </div>
    </div>
  )
}
