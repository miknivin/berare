"use server"

import { revalidatePath } from "next/cache"
import { requireStaff } from "@/lib/auth"
import { createServiceRoleClient } from "@berare/db/service-role"

export type ReviewActionResult = { success: true } | { success: false; error: string }

// Moderation only — customers manage their own review lifecycle via the
// storefront (product_reviews RLS). This is the one path where staff can
// remove a review after the fact, bypassing RLS via the service-role client.
export async function deleteReview(id: string): Promise<ReviewActionResult> {
  await requireStaff()

  const supabase = createServiceRoleClient()
  const { error } = await supabase.from("product_reviews").delete().eq("id", id)

  if (error) {
    return { success: false, error: "Could not delete review." }
  }

  revalidatePath("/reviews")
  return { success: true }
}
