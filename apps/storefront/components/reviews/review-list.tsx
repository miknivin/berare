import { StarRatingDisplay } from "./star-rating"
import { DeleteReviewButton } from "./delete-review-button"
import type { ProductReview } from "@/lib/data/reviews"

export function ReviewList({
  reviews,
  currentUserId,
  productSlug,
}: {
  reviews: ProductReview[]
  currentUserId: string | null
  productSlug: string
}) {
  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div key={review.id} className="border-b border-border pb-6 last:border-0">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <StarRatingDisplay rating={review.rating} />
              <span className="text-sm font-medium">{review.reviewer_name}</span>
            </div>
            {review.customer_id === currentUserId && (
              <DeleteReviewButton reviewId={review.id} productSlug={productSlug} />
            )}
          </div>
          {review.title && <p className="mt-2 text-sm font-medium">{review.title}</p>}
          <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{review.body}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            {new Date(review.created_at).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>
      ))}
    </div>
  )
}
