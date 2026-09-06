import { createServerSupabaseClient } from "@berare/db/server"

export type ProductReview = {
  id: string
  reviewer_name: string
  rating: number
  title: string | null
  body: string
  created_at: string
  customer_id: string
}

export async function getProductReviews(productId: string): Promise<ProductReview[]> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from("product_reviews")
    .select("id, reviewer_name, rating, title, body, created_at, customer_id")
    .eq("product_id", productId)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data ?? []
}

export type Testimonial = {
  id: string
  customer_name: string
  rating: number
  body: string
}

export async function getTestimonials(limit = 9): Promise<Testimonial[]> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from("testimonials")
    .select("id, customer_name, rating, body")
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) throw error
  return data ?? []
}

export type ReviewEligibility = {
  canReview: boolean
  existingReview: { id: string; rating: number; title: string | null; body: string } | null
}

// Decides what the review form should show: write a new review, edit an
// existing one, or nothing (never purchased this product). RLS already
// scopes order_items/product_reviews to the signed-in caller, so this
// naturally only ever sees the current user's own rows.
export async function getMyReviewEligibility(
  productId: string,
  isSignedIn: boolean
): Promise<ReviewEligibility> {
  if (!isSignedIn) {
    return { canReview: false, existingReview: null }
  }

  const supabase = await createServerSupabaseClient()

  const [{ data: existingReview }, { data: purchase }] = await Promise.all([
    supabase
      .from("product_reviews")
      .select("id, rating, title, body")
      .eq("product_id", productId)
      .maybeSingle(),
    supabase
      .from("order_items")
      .select("id, orders!inner(status)")
      .eq("product_id", productId)
      .in("orders.status", ["confirmed", "shipped", "delivered"])
      .limit(1)
      .maybeSingle(),
  ])

  return {
    canReview: !!purchase,
    existingReview: existingReview ?? null,
  }
}
