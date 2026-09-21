"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { requireStaff } from "@/lib/auth"
import { createServiceRoleClient } from "@berare/db/service-role"

export type WithdrawalActionResult = { success: true } | { success: false; error: string }

export async function approveWithdrawal(id: string): Promise<WithdrawalActionResult> {
  await requireStaff()

  const supabase = createServiceRoleClient()
  const { error } = await supabase
    .from("withdrawal_requests")
    .update({ status: "approved" })
    .eq("id", id)
    .eq("status", "requested")

  if (error) {
    return { success: false, error: "Could not approve withdrawal." }
  }

  revalidatePath("/withdrawals")
  return { success: true }
}

const rejectSchema = z.object({
  adminNote: z.string().optional(),
})

export async function rejectWithdrawal(
  id: string,
  input: z.infer<typeof rejectSchema>
): Promise<WithdrawalActionResult> {
  const { staff } = await requireStaff()

  const parsed = rejectSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: "Invalid input" }
  }

  const supabase = createServiceRoleClient()
  // The reverse_withdrawal_points_on_reject trigger (migration 0016) gives
  // the reserved points back to the affiliate the moment this lands.
  const { error } = await supabase
    .from("withdrawal_requests")
    .update({
      status: "rejected",
      admin_note: parsed.data.adminNote || null,
      processed_by: staff.id,
      processed_at: new Date().toISOString(),
    })
    .eq("id", id)
    .in("status", ["requested", "approved"])

  if (error) {
    return { success: false, error: "Could not reject withdrawal." }
  }

  revalidatePath("/withdrawals")
  return { success: true }
}

const markPaidSchema = z.object({
  payoutReference: z.string().trim().min(1, "Payout reference (UTR) is required"),
})

export async function markWithdrawalPaid(
  id: string,
  input: z.infer<typeof markPaidSchema>
): Promise<WithdrawalActionResult> {
  const { staff } = await requireStaff()

  const parsed = markPaidSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" }
  }

  const supabase = createServiceRoleClient()
  const { error } = await supabase
    .from("withdrawal_requests")
    .update({
      status: "paid",
      payout_reference: parsed.data.payoutReference,
      processed_by: staff.id,
      processed_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("status", "approved")

  if (error) {
    return { success: false, error: "Could not mark withdrawal as paid." }
  }

  revalidatePath("/withdrawals")
  return { success: true }
}
