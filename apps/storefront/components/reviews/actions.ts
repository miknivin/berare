"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { createServerSupabaseClient } from "@berare/db/server"

const reviewInputSchema = z.object({
  productId: z.string().uuid(),
  productSlug: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(120).optional(),
  body: z.string().min(1, "Review can't be empty").max(2000),
})

export type ReviewActionResult = { success: true } | { success: false; error: string }

// "Priya Sharma" -> "Priya S." — never shows a full name/email publicly.
function formatReviewerName(fullName: string | null): string {
  if (!fullName?.trim()) return "Verified Buyer"
  const parts = fullName.trim().split(/\s+/)
  if (parts.length === 1) return parts[0]
  return `${parts[0]} ${parts[parts.length - 1][0]}.`
}

export async function submitReview(input: z.infer<typeof reviewInputSchema>): Promise<ReviewActionResult> {
  const parsed = reviewInputSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" }
  }

  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: "Sign in required" }
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle()

  const { error } = await supabase.from("product_reviews").upsert(
    {
      product_id: parsed.data.productId,
      customer_id: user.id,
      reviewer_name: formatReviewerName(profile?.full_name ?? null),
      rating: parsed.data.rating,
      title: parsed.data.title || null,
      body: parsed.data.body,
    },
    { onConflict: "product_id,customer_id" }
  )

  if (error) {
    return {
      success: false,
      error:
        error.code === "42501"
          ? "Only customers who've purchased this product can review it."
          : "Could not save your review.",
    }
  }

  revalidatePath(`/products/${parsed.data.productSlug}`)
  return { success: true }
}

export async function deleteReview(reviewId: string, productSlug: string): Promise<ReviewActionResult> {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: "Sign in required" }
  }

  const { error } = await supabase.from("product_reviews").delete().eq("id", reviewId)
  if (error) {
    return { success: false, error: "Could not delete your review." }
  }

  revalidatePath(`/products/${productSlug}`)
  return { success: true }
}
