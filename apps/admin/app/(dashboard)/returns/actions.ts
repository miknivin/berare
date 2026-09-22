"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { requireStaff } from "@/lib/auth"
import { createServiceRoleClient } from "@berare/db/service-role"

export type ReturnActionResult = { success: true } | { success: false; error: string }

export async function acceptReturnRequest(id: string): Promise<ReturnActionResult> {
  const { staff } = await requireStaff()

  const supabase = createServiceRoleClient()
  const { error } = await supabase
    .from("return_requests")
    .update({ status: "accepted", reviewed_by: staff.id, reviewed_at: new Date().toISOString() })
    .eq("id", id)
    .eq("status", "requested")

  if (error) {
    return { success: false, error: "Could not accept return request." }
  }

  revalidatePath("/returns")
  revalidatePath("/orders")
  return { success: true }
}

const rejectSchema = z.object({
  adminNote: z.string().optional(),
})

export async function rejectReturnRequest(
  id: string,
  input: z.infer<typeof rejectSchema>
): Promise<ReturnActionResult> {
  const { staff } = await requireStaff()

  const parsed = rejectSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: "Invalid input" }
  }

  const supabase = createServiceRoleClient()
  const { error } = await supabase
    .from("return_requests")
    .update({
      status: "rejected",
      admin_note: parsed.data.adminNote || null,
      reviewed_by: staff.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", id)
    .in("status", ["requested", "accepted"])

  if (error) {
    return { success: false, error: "Could not reject return request." }
  }

  revalidatePath("/returns")
  revalidatePath("/orders")
  return { success: true }
}

export async function completeReturnRequest(id: string): Promise<ReturnActionResult> {
  const { staff } = await requireStaff()

  const supabase = createServiceRoleClient()
  const { error } = await supabase
    .from("return_requests")
    .update({ status: "completed", reviewed_by: staff.id, reviewed_at: new Date().toISOString() })
    .eq("id", id)
    .eq("status", "accepted")

  if (error) {
    return { success: false, error: "Could not complete return request." }
  }

  revalidatePath("/returns")
  revalidatePath("/orders")
  return { success: true }
}
