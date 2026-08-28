"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { requireStaff } from "@/lib/auth"
import { createServiceRoleClient } from "@berare/db/service-role"
import { slugify } from "@/lib/slugify"

export type AffiliateActionResult = { success: true } | { success: false; error: string }

function randomSuffix() {
  return Math.random().toString(36).slice(2, 6)
}

export async function approveApplication(applicationId: string): Promise<AffiliateActionResult> {
  const { staff } = await requireStaff()

  const supabase = createServiceRoleClient()
  const { data: application, error: fetchError } = await supabase
    .from("affiliate_applications")
    .select("id, applicant_id, full_name, status")
    .eq("id", applicationId)
    .maybeSingle()

  if (fetchError || !application) {
    return { success: false, error: "Application not found." }
  }
  if (application.status !== "pending") {
    return { success: false, error: "This application has already been reviewed." }
  }

  const base = slugify(application.full_name).slice(0, 15) || "affiliate"

  // referral_code is unique — retry with a fresh random suffix on the rare
  // collision rather than surfacing an internal detail to the admin, since
  // they never typed this value themselves.
  let insertError: { code?: string } | null = null
  for (let attempt = 0; attempt < 5; attempt++) {
    const referralCode = `${base}-${randomSuffix()}`
    const { error } = await supabase.from("affiliates").insert({
      profile_id: application.applicant_id,
      referral_code: referralCode,
    })
    if (!error) {
      insertError = null
      break
    }
    insertError = error
    if (error.code !== "23505") break
  }

  if (insertError) {
    return { success: false, error: "Could not create the affiliate record." }
  }

  const { error: updateError } = await supabase
    .from("affiliate_applications")
    .update({ status: "approved", reviewed_by: staff.id, reviewed_at: new Date().toISOString() })
    .eq("id", applicationId)

  if (updateError) {
    return { success: false, error: "Affiliate created, but could not update the application status." }
  }

  revalidatePath("/affiliates")
  return { success: true }
}

const rejectSchema = z.object({
  adminNote: z.string().optional(),
})

export async function rejectApplication(
  applicationId: string,
  input: z.infer<typeof rejectSchema>
): Promise<AffiliateActionResult> {
  const { staff } = await requireStaff()

  const parsed = rejectSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: "Invalid input" }
  }

  const supabase = createServiceRoleClient()
  const { error } = await supabase
    .from("affiliate_applications")
    .update({
      status: "rejected",
      admin_note: parsed.data.adminNote || null,
      reviewed_by: staff.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", applicationId)
    .eq("status", "pending")

  if (error) {
    return { success: false, error: "Could not reject the application." }
  }

  revalidatePath("/affiliates")
  return { success: true }
}

export async function toggleAffiliateStatus(
  affiliateId: string,
  status: "active" | "suspended"
): Promise<AffiliateActionResult> {
  await requireStaff()

  const supabase = createServiceRoleClient()
  const { error } = await supabase.from("affiliates").update({ status }).eq("id", affiliateId)

  if (error) {
    return { success: false, error: "Could not update affiliate status." }
  }

  revalidatePath("/affiliates")
  return { success: true }
}
