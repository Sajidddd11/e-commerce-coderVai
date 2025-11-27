import React from "react"

type ProductRatingProps = {
  averageRating?: number
  reviewCount?: number
  onViewReviews?: () => void
}

const ProductRating: React.FC<ProductRatingProps> = ({
  averageRating = 4.5,
  reviewCount = 0,
  onViewReviews,
}) => {
  const renderStars = (rating: number) => {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      const fillPercentage = Math.max(0, Math.min(1, rating - i + 1))
      stars.push(
        <div
          key={i}
          className="relative w-5 h-5 inline-block"
        >
          {/* Background star */}
          <span className="absolute inset-0 text-slate-300">★</span>
          {/* Filled star */}
          <span
            className="absolute inset-0 text-amber-400 overflow-hidden"
            style={{ width: `${fillPercentage * 100}%` }}
          >
            ★
          </span>
        </div>
      )
    }
    return stars
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1">
        {renderStars(averageRating)}
      </div>
      <div className="flex items-center gap-2 text-sm">
        <span className="font-medium text-slate-900">{averageRating.toFixed(1)}</span>
        {reviewCount > 0 && (
          <>
            <span className="text-slate-400">•</span>
            <button
              onClick={onViewReviews}
              className="text-slate-600 hover:text-slate-900 underline"
            >
              {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default ProductRating
