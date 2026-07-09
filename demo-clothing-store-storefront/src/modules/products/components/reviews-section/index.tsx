"use client"

import React, { useEffect, useState } from "react"
import { Star, ThumbsUp, ThumbsDown, ShieldCheck, AlertCircle } from "lucide-react"
import { sdk } from "@lib/config"

interface Review {
  id: string
  customer_name: string
  rating: number
  title: string
  content: string
  created_at: string
  helpful_count: number
  not_helpful_count: number
  is_verified_purchase: boolean
  admin_response?: string | null
}

interface RatingSummary {
  average: number
  count: number
  distribution: Record<number, number>
}

interface ReviewsSectionProps {
  productId: string
}

const ReviewsSection: React.FC<ReviewsSectionProps> = ({ productId }) => {
  const [reviews, setReviews] = useState<Review[]>([])
  const [ratingSummary, setRatingSummary] = useState<RatingSummary>({
    average: 0,
    count: 0,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  })
  const [loading, setLoading] = useState(true)
  const [filterRating, setFilterRating] = useState<number | null>(null)
  const [sortBy, setSortBy] = useState("recent")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [helpfulVotes, setHelpfulVotes] = useState<Record<string, "helpful" | "not_helpful" | null>>({})

  const fetchReviews = async (currentPage = 1, sort = sortBy) => {
    setLoading(true)
    try {
      const data = await sdk.client.fetch<any>(
        `/store/reviews/product/${productId}`,
        {
          method: "GET",
          query: {
            page: String(currentPage),
            limit: "10",
            sortBy: sort,
          },
        }
      )
      setReviews(data.reviews ?? [])
      setRatingSummary(data.rating_summary ?? { average: 0, count: 0, distribution: {} })
      setTotalPages(data.pagination?.pages ?? 1)
      setPage(currentPage)
    } catch (err) {
      console.error("[ReviewsSection] fetchReviews error:", err)
      setReviews([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (productId) fetchReviews(1, sortBy)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId])

  const handleSortChange = (newSort: string) => {
    setSortBy(newSort)
    fetchReviews(1, newSort)
  }

  const handleMarkHelpful = async (reviewId: string, isHelpful: boolean) => {
    if (helpfulVotes[reviewId]) return // already voted
    try {
      await sdk.client.fetch(`/store/reviews/${reviewId}/helpful`, {
        method: "POST",
        body: { is_helpful: isHelpful },
      })
      setHelpfulVotes((prev) => ({
        ...prev,
        [reviewId]: isHelpful ? "helpful" : "not_helpful",
      }))
      setReviews((prev) =>
        prev.map((r) =>
          r.id === reviewId
            ? {
                ...r,
                helpful_count: isHelpful ? r.helpful_count + 1 : r.helpful_count,
                not_helpful_count: !isHelpful ? r.not_helpful_count + 1 : r.not_helpful_count,
              }
            : r
        )
      )
    } catch {
      // ignore
    }
  }

  const renderStars = (rating: number, size = "text-sm") => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={14}
        className={i < rating ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-200"}
      />
    ))
  }

  const filteredReviews = filterRating
    ? reviews.filter((r) => Math.round(r.rating) === filterRating)
    : reviews

  const avgNum = ratingSummary.average || 0

  return (
    <div className="py-8 space-y-8">
      {/* ── Summary row ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 small:grid-cols-2 gap-8 pb-8 border-b border-slate-200">
        {/* Left — average */}
        <div>
          <h3 className="text-2xl font-bold text-slate-900 mb-4">Customer Reviews</h3>
          <div className="space-y-3">
            <div className="flex items-baseline gap-3">
              <span className="text-5xl font-bold text-slate-900">
                {ratingSummary.count > 0 ? avgNum.toFixed(1) : "—"}
              </span>
              <div className="flex gap-0.5">{renderStars(Math.round(avgNum))}</div>
            </div>
            <p className="text-sm text-slate-600">
              Based on {ratingSummary.count}{" "}
              {ratingSummary.count === 1 ? "review" : "reviews"}
            </p>

            {/* Order-gated info note */}
            <div className="flex items-start gap-2 mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
              <ShieldCheck size={16} className="text-slate-500 mt-0.5 shrink-0" />
              <p className="text-xs text-slate-600">
                All reviews are from verified purchases. To leave a review, visit{" "}
                <a
                  href="/account/orders"
                  className="text-slate-900 underline underline-offset-2 font-medium hover:text-slate-700"
                >
                  My Orders
                </a>{" "}
                after your order is delivered.
              </p>
            </div>
          </div>
        </div>

        {/* Right — distribution */}
        <div className="space-y-2">
          <h4 className="font-semibold text-slate-900 text-sm uppercase tracking-wide mb-4">
            Rating Breakdown
          </h4>
          {[5, 4, 3, 2, 1].map((star) => {
            const count = ratingSummary.distribution?.[star] ?? 0
            const total = ratingSummary.count || 1
            const pct = (count / total) * 100
            return (
              <button
                key={star}
                onClick={() => setFilterRating(filterRating === star ? null : star)}
                className={`w-full flex items-center gap-3 text-sm p-2 rounded hover:bg-slate-100 transition-colors ${
                  filterRating === star ? "bg-slate-100" : ""
                }`}
              >
                <div className="flex gap-0.5">{renderStars(star)}</div>
                <div className="flex-1 h-2 bg-slate-200 rounded overflow-hidden">
                  <div className="h-full bg-amber-400 transition-all" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-slate-600 min-w-fit text-xs">({count})</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Sort bar ────────────────────────────────────────────────── */}
      {ratingSummary.count > 0 && (
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-600">Sort by:</span>
          {["recent", "helpful", "rating_high", "rating_low"].map((opt) => {
            const labels: Record<string, string> = {
              recent: "Most Recent",
              helpful: "Most Helpful",
              rating_high: "Highest Rating",
              rating_low: "Lowest Rating",
            }
            return (
              <button
                key={opt}
                onClick={() => handleSortChange(opt)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                  sortBy === opt
                    ? "bg-slate-900 text-white border-slate-900"
                    : "border-slate-300 text-slate-600 hover:border-slate-400"
                }`}
              >
                {labels[opt]}
              </button>
            )
          })}
        </div>
      )}

      {/* ── Reviews list ─────────────────────────────────────────────── */}
      <div className="space-y-6">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse pb-6 border-b border-slate-200">
                <div className="h-4 bg-slate-200 rounded w-32 mb-2" />
                <div className="h-3 bg-slate-200 rounded w-24 mb-3" />
                <div className="h-3 bg-slate-200 rounded w-full mb-1" />
                <div className="h-3 bg-slate-200 rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <AlertCircle size={32} className="mx-auto text-slate-300" />
            <p className="text-slate-500">
              {filterRating
                ? "No reviews with this rating yet."
                : "No reviews yet. Be the first to review after your order is delivered!"}
            </p>
          </div>
        ) : (
          filteredReviews.map((review) => (
            <div key={review.id} className="pb-6 border-b border-slate-200 last:border-b-0">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900 text-sm">
                      {review.customer_name || "Customer"}
                    </span>
                    {review.is_verified_purchase && (
                      <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                        <ShieldCheck size={11} />
                        Verified Purchase
                      </span>
                    )}
                    <span className="text-xs text-slate-400">
                      {new Date(review.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex gap-0.5">{renderStars(review.rating)}</div>
                  {review.title && (
                    <h5 className="font-semibold text-slate-900 text-sm">{review.title}</h5>
                  )}
                </div>
              </div>

              {/* Body */}
              <p className="text-slate-700 text-sm mb-4 leading-relaxed">{review.content}</p>

              {/* Admin response */}
              {review.admin_response && (
                <div className="bg-slate-50 rounded-lg p-3 mb-4 border border-slate-200">
                  <p className="text-xs font-semibold text-slate-700 mb-1">Response from store</p>
                  <p className="text-xs text-slate-600">{review.admin_response}</p>
                </div>
              )}

              {/* Helpful */}
              <div className="flex items-center gap-4 text-sm">
                <span className="text-slate-500 text-xs">Helpful?</span>
                <button
                  onClick={() => handleMarkHelpful(review.id, true)}
                  disabled={!!helpfulVotes[review.id]}
                  className={`flex items-center gap-1 px-3 py-1 rounded border text-xs transition-colors disabled:opacity-60 ${
                    helpfulVotes[review.id] === "helpful"
                      ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                      : "border-slate-300 text-slate-600 hover:border-slate-400"
                  }`}
                >
                  <ThumbsUp size={12} />
                  {review.helpful_count}
                </button>
                <button
                  onClick={() => handleMarkHelpful(review.id, false)}
                  disabled={!!helpfulVotes[review.id]}
                  className={`flex items-center gap-1 px-3 py-1 rounded border text-xs transition-colors disabled:opacity-60 ${
                    helpfulVotes[review.id] === "not_helpful"
                      ? "bg-rose-50 border-rose-200 text-rose-700"
                      : "border-slate-300 text-slate-600 hover:border-slate-400"
                  }`}
                >
                  <ThumbsDown size={12} />
                  {review.not_helpful_count}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── Pagination ──────────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => fetchReviews(page - 1)}
            disabled={page <= 1}
            className="px-3 py-1 text-sm border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-sm text-slate-600">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => fetchReviews(page + 1)}
            disabled={page >= totalPages}
            className="px-3 py-1 text-sm border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

export default ReviewsSection
