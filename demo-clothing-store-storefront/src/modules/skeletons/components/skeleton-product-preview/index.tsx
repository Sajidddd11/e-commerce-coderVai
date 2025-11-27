const SkeletonProductPreview = () => {
  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-sm overflow-hidden animate-pulse">
      {/* Image Container */}
      <div className="w-full bg-gradient-to-br from-slate-200 to-slate-100" style={{ aspectRatio: "3/4" }} />

      {/* Content Container */}
      <div className="flex flex-col flex-1 p-4 small:p-6">
        {/* Category */}
        <div className="h-3 w-16 bg-slate-200 rounded mb-3" />

        {/* Title */}
        <div className="space-y-2 mb-4">
          <div className="h-4 bg-slate-200 rounded" />
          <div className="h-4 w-4/5 bg-slate-200 rounded" />
        </div>

        {/* Description */}
        <div className="h-3 w-3/4 bg-slate-200 rounded mb-4 flex-grow" />

        {/* Divider */}
        <div className="w-12 h-1 bg-slate-200 rounded-full mb-4" />

        {/* Footer */}
        <div className="flex items-center justify-between">
          {/* Price */}
          <div className="space-y-2">
            <div className="h-3 w-12 bg-slate-200 rounded" />
            <div className="h-5 w-20 bg-slate-200 rounded" />
          </div>

          {/* Rating */}
          <div className="w-8 h-8 bg-slate-200 rounded-lg" />
        </div>
      </div>
    </div>
  )
}

export default SkeletonProductPreview
