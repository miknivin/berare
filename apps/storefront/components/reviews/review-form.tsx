"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { StarRatingInput } from "./star-rating"
import { submitReview } from "./actions"

export function ReviewForm({
  productId,
  productSlug,
  existingReview,
}: {
  productId: string
  productSlug: string
  existingReview: { id: string; rating: number; title: string | null; body: string } | null
}) {
  const router = useRouter()
  const [rating, setRating] = useState(existingReview?.rating ?? 0)
  const [title, setTitle] = useState(existingReview?.title ?? "")
  const [body, setBody] = useState(existingReview?.body ?? "")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (rating < 1) {
      setError("Please select a star rating.")
      return
    }

    setIsSubmitting(true)
    const result = await submitReview({ productId, productSlug, rating, title, body })
    setIsSubmitting(false)

    if (!result.success) {
      setError(result.error)
      return
    }

    setSubmitted(true)
    router.refresh()
  }

  if (submitted) {
    return (
      <p className="text-sm text-muted-foreground">
        {existingReview ? "Your review has been updated." : "Thanks for your review!"}
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
      <div>
        <label className="block text-sm font-medium mb-2">Your rating</label>
        <StarRatingInput value={rating} onChange={setRating} />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="review-title" className="block text-sm font-medium">
          Title <span className="text-muted-foreground font-normal">(optional)</span>
        </label>
        <input
          id="review-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={120}
          className="w-full min-h-11 rounded-lg border border-border bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="review-body" className="block text-sm font-medium">
          Your review
        </label>
        <textarea
          id="review-body"
          required
          rows={4}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          maxLength={2000}
          className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="min-h-11 rounded-full bg-primary text-primary-foreground px-6 py-3 text-sm font-medium hover:bg-primary-hover transition-colors disabled:opacity-50"
      >
        {isSubmitting ? "Saving…" : existingReview ? "Update Review" : "Submit Review"}
      </button>
    </form>
  )
}
