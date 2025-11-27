"use client"

import React, { useState } from "react"

interface ReviewFormProps {
  onSubmit: (review: {
    author: string
    rating: number
    title: string
    comment: string
    date: string
  }) => void
  onCancel: () => void
}

const ReviewForm: React.FC<ReviewFormProps> = ({ onSubmit, onCancel }) => {
  const [rating, setRating] = useState(5)
  const [hoverRating, setHoverRating] = useState(0)
  const [title, setTitle] = useState("")
  const [comment, setComment] = useState("")
  const [author, setAuthor] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}

    if (!author.trim()) newErrors.author = "Name is required"
    if (!title.trim()) newErrors.title = "Review title is required"
    if (!comment.trim()) newErrors.comment = "Review comment is required"

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    onSubmit({
      author,
      rating,
      title,
      comment,
      date: new Date().toISOString().split("T")[0],
    })

    // Reset form
    setAuthor("")
    setTitle("")
    setComment("")
    setRating(5)
  }

  const renderStars = (count: number, interactive = false) => {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <button
          key={i}
          type={interactive ? "button" : "div"}
          onClick={interactive ? () => setRating(i) : undefined}
          onMouseEnter={interactive ? () => setHoverRating(i) : undefined}
          onMouseLeave={interactive ? () => setHoverRating(0) : undefined}
          className={`text-2xl transition-colors ${
            interactive ? "cursor-pointer" : ""
          } ${
            i <= (hoverRating || rating) ? "text-amber-400" : "text-slate-300"
          }`}
        >
          ★
        </button>
      )
    }
    return stars
  }

  return (
    <div className="bg-slate-50 rounded-lg p-6 mb-8 border border-slate-200">
      <h4 className="text-lg font-semibold text-slate-900 mb-6">Share Your Review</h4>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-slate-900 mb-2">
            Rating
          </label>
          <div className="flex gap-2">{renderStars(rating, true)}</div>
          {errors.rating && <p className="text-red-500 text-xs mt-1">{errors.rating}</p>}
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-slate-900 mb-2">
            Your Name
          </label>
          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Enter your name"
            className={`w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 ${
              errors.author ? "border-red-500" : "border-slate-300"
            }`}
          />
          {errors.author && <p className="text-red-500 text-xs mt-1">{errors.author}</p>}
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-slate-900 mb-2">
            Review Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Summarize your experience"
            className={`w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 ${
              errors.title ? "border-red-500" : "border-slate-300"
            }`}
          />
          {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
        </div>

        {/* Comment */}
        <div>
          <label className="block text-sm font-medium text-slate-900 mb-2">
            Your Review
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your detailed thoughts..."
            rows={5}
            className={`w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none ${
              errors.comment ? "border-red-500" : "border-slate-300"
            }`}
          />
          {errors.comment && <p className="text-red-500 text-xs mt-1">{errors.comment}</p>}
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            className="flex-1 bg-slate-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-slate-800 transition-colors"
          >
            Submit Review
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 border border-slate-300 text-slate-900 px-4 py-2 rounded-lg font-medium hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default ReviewForm
