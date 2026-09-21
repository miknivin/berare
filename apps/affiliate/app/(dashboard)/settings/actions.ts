"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { createServerSupabaseClient } from "@berare/db/server"
import { requireActiveAffiliate } from "@/lib/auth"
import { getMyLedger, availablePointsFrom } from "@/lib/data/affiliate"
import { MIN_WITHDRAWAL_POINTS } from "@/lib/withdrawal"

export type SettingsActionResult = { success: true } | { success: false; error: string }

const payoutDetailsSchema = z.object({
  accountHolderName: z.string().trim().min(1, "Account holder name is required").max(200),
  accountNumber: z
    .string()
    .trim()
    .regex(/^\d{9,18}$/, "Enter a valid account number (9–18 digits)"),
  ifscCode: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Enter a valid IFSC code (e.g. HDFC0001234)"),
})

export async function updatePayoutDetails(
  input: z.infer<typeof payoutDetailsSchema>
): Promise<SettingsActionResult> {
  const { affiliate } = await requireActiveAffiliate()

  const parsed = payoutDetailsSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" }
  }

  const supabase = await createServerSupabaseClient()
  const { error } = await supabase
    .from("affiliates")
    .update({ payout_details: parsed.data })
    .eq("id", affiliate.id)

  if (error) {
    return { success: false, error: "Could not save bank details." }
  }

  revalidatePath("/settings")
  return { success: true }
}

const requestWithdrawalSchema = z.object({
  points: z.coerce.number().positive("Enter a positive amount"),
})

// Points-to-INR conversion is currently fixed at 1:1, matching
// app_config.points_to_inr_rate's placeholder value (open-business-
// decisions.md row 10). The affiliate app has no read access to app_config
// (service-role only), so this mirrors that value rather than reading it.
const POINTS_TO_INR_RATE = 1

export async function requestWithdrawal(
  input: z.infer<typeof requestWithdrawalSchema>
): Promise<SettingsActionResult> {
  const { affiliate } = await requireActiveAffiliate()

  if (!affiliate.payout_details) {
    return { success: false, error: "Add your bank details before requesting a withdrawal." }
  }

  const parsed = requestWithdrawalSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" }
  }

  const ledger = await getMyLedger(affiliate.id)
  const available = availablePointsFrom(ledger)

  if (available < MIN_WITHDRAWAL_POINTS) {
    return {
      success: false,
      error: `You need at least ${MIN_WITHDRAWAL_POINTS} points to request a withdrawal.`,
    }
  }
  if (parsed.data.points > available) {
    return { success: false, error: `You only have ${available} points available.` }
  }

  const supabase = await createServerSupabaseClient()
  const { error } = await supabase.from("withdrawal_requests").insert({
    affiliate_id: affiliate.id,
    points_requested: parsed.data.points,
    amount_requested: parsed.data.points * POINTS_TO_INR_RATE,
  })

  if (error) {
    return { success: false, error: "Could not submit withdrawal request." }
  }

  revalidatePath("/settings")
  return { success: true }
}
