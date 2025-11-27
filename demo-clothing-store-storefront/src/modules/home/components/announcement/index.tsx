export default function Announcement() {
  return (
    <div className="w-full bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900">
      <div className="content-container">
        <div className="flex flex-col small:flex-row items-center justify-between py-6 small:py-4 gap-4 small:gap-0">
          <div className="text-center small:text-left flex-1">
            <p className="text-sm small:text-base text-slate-200 font-medium">
              🎉 Exclusive Launch Offer
            </p>
            <p className="text-xs small:text-sm text-slate-400 mt-1">
              Get 20% off on your first purchase with code: <span className="font-semibold text-white">WELCOME20</span>
            </p>
          </div>
          <div className="hidden small:flex items-center gap-2 text-slate-300 hover:text-white transition-colors cursor-pointer group">
            <span className="text-sm font-medium">Shop Now</span>
            <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
          </div>
        </div>
      </div>
    </div>
  )
}
