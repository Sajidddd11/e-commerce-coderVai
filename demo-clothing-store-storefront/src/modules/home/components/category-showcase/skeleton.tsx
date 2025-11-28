export function CategoryCardSkeleton() {
  return (
    <div className="h-[200px] overflow-hidden rounded-lg bg-slate-200 animate-pulse" />
  )
}

export function ProductGridSkeleton() {
  return (
    <div className="h-[300px] overflow-hidden">
      <div className="grid grid-cols-2 small:grid-cols-3 medium:grid-cols-6 gap-3 small:gap-4 h-full">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-slate-200 rounded-lg animate-pulse"
          />
        ))}
      </div>
    </div>
  )
}

export function CategorySectionSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <CategoryCardSkeleton />
      <ProductGridSkeleton />
    </div>
  )
}