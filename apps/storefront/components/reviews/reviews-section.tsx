import { getProductReviews, getMyReviewEligibility } from "@/lib/data/reviews"
import { getCurrentUser } from "@/lib/data/auth"
import { StarRatingDisplay } from "./star-rating"
import { ReviewList } from "./review-list"
import { ReviewForm } from "./review-form"
import { TestimonialsSection } from "@/components/testimonials/testimonials-section"

export async function ReviewsSection({
  productId,
  productSlug,
}: {
  productId: string
  productSlug: string
}) {
  const [reviews, user] = await Promise.all([getProductReviews(productId), getCurrentUser()])
  const { canReview, existingReview } = await getMyReviewEligibility(productId, !!user)

  if (reviews.length === 0) {
    return (
      <div className="space-y-10">
        <div>
          <h2 className="font-heading text-2xl mb-2">Reviews</h2>
          <p className="text-sm text-muted-foreground">No reviews yet for this product.</p>
        </div>

        {canReview && (
          <div>
            <h3 className="font-heading text-lg mb-4">
              {existingReview ? "Edit Your Review" : "Be the First to Review"}
            </h3>
            <ReviewForm productId={productId} productSlug={productSlug} existingReview={existingReview} />
          </div>
        )}

        {/* Storefront-wide fallback per the product having no reviews yet. */}
        <TestimonialsSection title="What Our Customers Say" />
      </div>
    )
  }

  const avgRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length

  return (
    <div className="space-y-10">
      <div className="flex items-center gap-3 flex-wrap">
        <h2 className="font-heading text-2xl">Reviews</h2>
        <StarRatingDisplay rating={avgRating} size="md" />
        <span className="text-sm text-muted-foreground">
          {avgRating.toFixed(1)} ({reviews.length} review{reviews.length === 1 ? "" : "s"})
        </span>
      </div>

      {canReview && (
        <div>
          <h3 className="font-heading text-lg mb-4">{existingReview ? "Edit Your Review" : "Write a Review"}</h3>
          <ReviewForm productId={productId} productSlug={productSlug} existingReview={existingReview} />
        </div>
      )}

      <ReviewList reviews={reviews} currentUserId={user?.id ?? null} productSlug={productSlug} />
    </div>
  )
}
