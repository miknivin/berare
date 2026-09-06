"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { deleteReview } from "./actions"

export function DeleteReviewButton({ reviewId, productSlug }: { reviewId: string; productSlug: string }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleDelete() {
    if (!confirm("Delete your review?")) return
    setError(null)
    startTransition(async () => {
      const result = await deleteReview(reviewId, productSlug)
      if (!result.success) {
        setError(result.error)
        return
      }
      router.refresh()
    })
  }

  return (
    <div className="flex items-center gap-2">
      {error && <span className="text-xs text-destructive">{error}</span>}
      <button
        type="button"
        onClick={handleDelete}
        disabled={isPending}
        className="text-xs text-muted-foreground hover:text-destructive underline underline-offset-2 disabled:opacity-50"
      >
        {isPending ? "Deleting…" : "Delete"}
      </button>
    </div>
  )
}
