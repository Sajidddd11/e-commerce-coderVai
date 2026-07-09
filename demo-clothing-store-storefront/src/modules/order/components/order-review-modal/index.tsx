"use client"

import React, { useState } from "react"
import { Star, X, CheckCircle, Loader2 } from "lucide-react"
import { submitProductReview } from "@lib/data/reviews"

interface OrderReviewModalProps {
  product: {
    id: string
    title: string
    thumbnail?: string | null
  }
  orderId: string
  customerName: string
  customerEmail: string
  onClose: () => void
  onSubmitted: () => void
}

const OrderReviewModal: React.FC<OrderReviewModalProps> = ({
  product,
  orderId,
  customerName,
  customerEmail,
  onClose,
  onSubmitted,
}) => {
  const [rating, setRating] = useState(5)
  const [hoverRating, setHoverRating] = useState(0)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validate
    const newErrors: Record<string, string> = {}
    if (!title.trim()) newErrors.title = "Review title is required"
    if (!content.trim()) newErrors.content = "Review comment is required"
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setSubmitting(true)
    try {
      // Use the server action — handles publishable key + auth cookie server-side
      const result = await submitProductReview({
        productId: product.id,
        orderId,
        rating,
        title,
        content,
        customerName,
        customerEmail,
      })

      if (!result.success) {
        setError(result.message)
        return
      }

      setSubmitted(true)
      setTimeout(() => {
        onSubmitted()
        onClose()
      }, 2000)
    } catch {
      setError("Network error. Please check your connection and try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const starColor = (i: number) => {
    const filled = i <= (hoverRating || rating)
    return filled ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-200"
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-lg">Write a Review</h3>
            <p className="text-sm text-slate-500 mt-0.5 truncate max-w-[280px]">
              {product.title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-3">
            <CheckCircle size={48} className="mx-auto text-emerald-500" />
            <p className="font-semibold text-slate-900">Review submitted!</p>
            <p className="text-sm text-slate-500">
              Your review will appear after admin approval. Thank you!
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Star Rating */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-3">
                Your Rating
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setRating(i)}
                    onMouseEnter={() => setHoverRating(i)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star size={28} className={starColor(i)} />
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][hoverRating || rating]}
              </p>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Review Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value)
                  setErrors((prev) => ({ ...prev, title: "" }))
                }}
                placeholder="Summarize your experience"
                className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 transition-shadow ${
                  errors.title ? "border-red-400" : "border-slate-300"
                }`}
              />
              {errors.title && (
                <p className="text-red-500 text-xs mt-1">{errors.title}</p>
              )}
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Your Review
              </label>
              <textarea
                value={content}
                onChange={(e) => {
                  setContent(e.target.value)
                  setErrors((prev) => ({ ...prev, content: "" }))
                }}
                placeholder="Share your detailed thoughts about this product..."
                rows={4}
                className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none transition-shadow ${
                  errors.content ? "border-red-400" : "border-slate-300"
                }`}
              />
              {errors.content && (
                <p className="text-red-500 text-xs mt-1">{errors.content}</p>
              )}
            </div>

            {/* Error message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 flex items-center justify-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-slate-800 transition-colors disabled:opacity-60"
              >
                {submitting && <Loader2 size={16} className="animate-spin" />}
                {submitting ? "Submitting..." : "Submit Review"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 border border-slate-300 text-slate-700 px-4 py-2.5 rounded-lg font-medium hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
            </div>

            <p className="text-xs text-slate-400 text-center">
              Reviews are verified purchases and appear after admin approval.
            </p>
          </form>
        )}
      </div>
    </div>
  )
}

export default OrderReviewModal
