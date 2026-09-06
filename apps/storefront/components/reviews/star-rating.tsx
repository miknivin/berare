"use client"

import { Star } from "lucide-react"

export function StarRatingDisplay({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  const starClass = size === "md" ? "w-5 h-5" : "w-3.5 h-3.5"
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`${starClass} ${n <= Math.round(rating) ? "fill-primary text-primary" : "fill-none text-muted-foreground"}`}
          aria-hidden="true"
        />
      ))}
    </div>
  )
}

export function StarRatingInput({
  value,
  onChange,
}: {
  value: number
  onChange: (rating: number) => void
}) {
  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} star${n > 1 ? "s" : ""}`}
          onClick={() => onChange(n)}
          className="p-1 -m-1"
        >
          <Star
            className={`w-7 h-7 transition-colors ${n <= value ? "fill-primary text-primary" : "fill-none text-muted-foreground"}`}
            aria-hidden="true"
          />
        </button>
      ))}
    </div>
  )
}
