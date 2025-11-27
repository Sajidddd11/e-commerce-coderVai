"use client"

import React, { useState } from "react"
import ReviewForm from "./review-form"

interface Review {
  id: string
  author: string
  rating: number
  title: string
  comment: string
  date: string
  helpful: number
  unhelpful: number
  userHelpful?: boolean
}

const ReviewsSection: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([
    {
      id: "1",
      author: "Sarah Johnson",
      rating: 5,
      title: "Excellent quality!",
      comment: "This product exceeded my expectations. The quality is outstanding and it arrived quickly. Highly recommend!",
      date: "2024-01-15",
      helpful: 24,
      unhelpful: 2,
      userHelpful: false,
    },
    {
      id: "2",
      author: "Michael Chen",
      rating: 4,
      title: "Great product, good value",
      comment: "Very satisfied with this purchase. True to size and great color. Delivery was fast.",
      date: "2024-01-10",
      helpful: 18,
      unhelpful: 1,
      userHelpful: false,
    },
    {
      id: "3",
      author: "Emma Davis",
      rating: 5,
      title: "Perfect!",
      comment: "Exactly what I was looking for. Superior craftsmanship and attention to detail.",
      date: "2024-01-08",
      helpful: 12,
      unhelpful: 0,
      userHelpful: false,
    },
  ])

  const [showForm, setShowForm] = useState(false)
  const [filterRating, setFilterRating] = useState<number | null>(null)

  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : 0

  const filteredReviews = filterRating
    ? reviews.filter((r) => r.rating === filterRating)
    : reviews

  const handleHelpful = (reviewId: string, helpful: boolean) => {
    setReviews(
      reviews.map((review) => {
        if (review.id === reviewId) {
          if (helpful) {
            return {
              ...review,
              helpful: review.userHelpful ? review.helpful - 1 : review.helpful + 1,
              unhelpful: review.userHelpful === false ? review.unhelpful - 1 : review.unhelpful,
              userHelpful: !review.userHelpful,
            }
          } else {
            return {
              ...review,
              unhelpful: review.userHelpful === false ? review.unhelpful + 1 : review.unhelpful - 1,
              helpful: review.userHelpful ? review.helpful - 1 : review.helpful,
              userHelpful: review.userHelpful === false ? undefined : false,
            }
          }
        }
        return review
      })
    )
  }

  const handleAddReview = (newReview: Omit<Review, "id" | "helpful" | "unhelpful" | "userHelpful">) => {
    const review: Review = {
      ...newReview,
      id: Date.now().toString(),
      helpful: 0,
      unhelpful: 0,
    }
    setReviews([review, ...reviews])
    setShowForm(false)
  }

  const renderStars = (rating: number) => {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className={i <= rating ? "text-amber-400" : "text-slate-300"}
        >
          ★
        </span>
      )
    }
    return stars
  }

  return (
    <div className="py-8 space-y-8">
      {/* Review Summary */}
      <div className="grid grid-cols-1 small:grid-cols-2 gap-8 pb-8 border-b border-slate-200">
        {/* Summary Stats */}
        <div>
          <h3 className="text-2xl font-bold text-slate-900 mb-4">Customer Reviews</h3>
          <div className="space-y-3">
            <div className="flex items-baseline gap-3">
              <span className="text-5xl font-bold text-slate-900">{averageRating}</span>
              <div className="flex gap-1 text-xl">{renderStars(Math.round(Number(averageRating)))}</div>
            </div>
            <p className="text-sm text-slate-600">
              Based on {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
            </p>
            <button
              onClick={() => setShowForm(!showForm)}
              className="inline-block bg-slate-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-slate-800 transition-colors mt-4"
            >
              Write a Review
            </button>
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="space-y-2">
          <h4 className="font-semibold text-slate-900 text-sm uppercase tracking-wide mb-4">
            Rating Breakdown
          </h4>
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = reviews.filter((r) => r.rating === rating).length
            const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0
            return (
              <button
                key={rating}
                onClick={() => setFilterRating(filterRating === rating ? null : rating)}
                className={`w-full flex items-center gap-3 text-sm p-2 rounded hover:bg-slate-100 transition-colors ${
                  filterRating === rating ? "bg-slate-100" : ""
                }`}
              >
                <span className="flex gap-1 text-base">{renderStars(rating)}</span>
                <div className="flex-1 h-2 bg-slate-200 rounded overflow-hidden">
                  <div
                    className="h-full bg-amber-400 transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-slate-600 min-w-fit">({count})</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Review Form */}
      {showForm && <ReviewForm onSubmit={handleAddReview} onCancel={() => setShowForm(false)} />}

      {/* Reviews List */}
      <div className="space-y-6">
        {filteredReviews.length === 0 ? (
          <p className="text-center text-slate-500 py-8">
            {filterRating ? "No reviews with this rating yet." : "No reviews yet. Be the first to review!"}
          </p>
        ) : (
          filteredReviews.map((review) => (
            <div key={review.id} className="pb-6 border-b border-slate-200 last:border-b-0">
              {/* Review Header */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex gap-2 items-center mb-2">
                    <span className="font-semibold text-slate-900">{review.author}</span>
                    <span className="text-xs text-slate-500">{review.date}</span>
                  </div>
                  <div className="flex gap-1 text-sm mb-1">{renderStars(review.rating)}</div>
                  <h5 className="font-semibold text-slate-900 text-sm">{review.title}</h5>
                </div>
              </div>

              {/* Review Content */}
              <p className="text-slate-700 text-sm mb-4 leading-relaxed">{review.comment}</p>

              {/* Helpful Section */}
              <div className="flex items-center gap-6 text-sm">
                <span className="text-slate-500">Helpful?</span>
                <button
                  onClick={() => handleHelpful(review.id, true)}
                  className={`flex items-center gap-1 px-3 py-1 rounded border transition-colors ${
                    review.userHelpful === true
                      ? "bg-green-50 border-green-200 text-green-700"
                      : "border-slate-300 text-slate-600 hover:border-slate-400"
                  }`}
                >
                  <span>👍</span>
                  <span>{review.helpful}</span>
                </button>
                <button
                  onClick={() => handleHelpful(review.id, false)}
                  className={`flex items-center gap-1 px-3 py-1 rounded border transition-colors ${
                    review.userHelpful === false
                      ? "bg-red-50 border-red-200 text-red-700"
                      : "border-slate-300 text-slate-600 hover:border-slate-400"
                  }`}
                >
                  <span>👎</span>
                  <span>{review.unhelpful}</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default ReviewsSection
