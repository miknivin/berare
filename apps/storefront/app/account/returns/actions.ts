"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { createServerSupabaseClient } from "@berare/db/server"

export type ReturnActionResult = { success: true } | { success: false; error: string }

const RETURN_REASONS = ["damaged", "wrong_item", "missing_item", "expired", "changed_mind", "other"] as const

const returnRequestSchema = z.object({
  orderId: z.string().uuid(),
  reason: z.enum(RETURN_REASONS),
  message: z.string().max(2000).optional(),
})

export async function submitReturnRequest(
  input: z.infer<typeof returnRequestSchema>
): Promise<ReturnActionResult> {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "You must be signed in to request a return." }

  const parsed = returnRequestSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" }
  }

  const { error } = await supabase.from("return_requests").insert({
    order_id: parsed.data.orderId,
    customer_id: user.id,
    reason: parsed.data.reason,
    message: parsed.data.message || null,
  })

  if (error) {
    // validate_return_request() raises a specific, already-customer-facing
    // message (not delivered / window passed / not your order) — surface
    // it directly instead of a generic fallback.
    return { success: false, error: error.message || "Could not submit return request." }
  }

  revalidatePath("/account/returns")
  revalidatePath("/account/orders")
  return { success: true }
}
