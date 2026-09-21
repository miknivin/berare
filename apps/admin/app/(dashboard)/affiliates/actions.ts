"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { requireStaff } from "@/lib/auth"
import { createServiceRoleClient } from "@berare/db/service-role"
import { slugify } from "@/lib/slugify"
import { sendEmail } from "@/lib/email"

const AFFILIATE_URL = process.env.NEXT_PUBLIC_AFFILIATE_URL ?? ""

export type AffiliateActionResult = { success: true } | { success: false; error: string }

function randomSuffix() {
  return Math.random().toString(36).slice(2, 6)
}

export async function approveApplication(applicationId: string): Promise<AffiliateActionResult> {
  const { staff } = await requireStaff()

  const supabase = createServiceRoleClient()
  const { data: application, error: fetchError } = await supabase
    .from("affiliate_applications")
    .select("id, applicant_id, full_name, email, status")
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
  let affiliateId: string | null = null
  let insertError: { code?: string } | null = null
  for (let attempt = 0; attempt < 5; attempt++) {
    const referralCode = `${base}-${randomSuffix()}`
    const { data: affiliate, error } = await supabase
      .from("affiliates")
      .insert({ profile_id: application.applicant_id, referral_code: referralCode })
      .select("id")
      .single()
    if (!error) {
      affiliateId = affiliate.id
      insertError = null
      break
    }
    insertError = error
    if (error.code !== "23505") break
  }

  if (insertError || !affiliateId) {
    return { success: false, error: "Could not create the affiliate record." }
  }

  const { error: updateError } = await supabase
    .from("affiliate_applications")
    .update({ status: "approved", reviewed_by: staff.id, reviewed_at: new Date().toISOString() })
    .eq("id", applicationId)

  if (updateError) {
    // No application-status change went through, so undo the affiliate
    // record too — there's no "half approved" state left behind.
    await supabase.from("affiliates").delete().eq("id", affiliateId)
    return { success: false, error: "Could not update the application status." }
  }

  // The notification is part of "approval" as far as the admin is
  // concerned — awaited, and a failure rolls back everything above so this
  // stays cleanly retryable instead of silently half-succeeding.
  try {
    await sendEmail({
      to: application.email,
      subject: "Your Berare affiliate application was approved!",
      html: `
        <p>Hi ${application.full_name},</p>
        <p>Good news — your application to become a Berare affiliate has been approved.</p>
        <p>Sign in to your affiliate portal to get your referral links and start earning:</p>
        <p><a href="${AFFILIATE_URL}">${AFFILIATE_URL}</a></p>
        <p>Sign in with the same email you applied with — we'll email you a one-time code.</p>
        <p>— Team Berare</p>
      `,
    })
  } catch (emailError) {
    console.error("Approval email failed, rolling back approval", applicationId, emailError)
    await supabase
      .from("affiliate_applications")
      .update({ status: "pending", reviewed_by: null, reviewed_at: null })
      .eq("id", applicationId)
    await supabase.from("affiliates").delete().eq("id", affiliateId)
    return { success: false, error: "Could not send the approval email. The application was not approved — please try again." }
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
  const { data: application, error } = await supabase
    .from("affiliate_applications")
    .update({
      status: "rejected",
      admin_note: parsed.data.adminNote || null,
      reviewed_by: staff.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", applicationId)
    .eq("status", "pending")
    .select("email, full_name")
    .maybeSingle()

  if (error) {
    return { success: false, error: "Could not reject the application." }
  }
  if (!application) {
    return { success: false, error: "This application has already been reviewed." }
  }

  try {
    await sendEmail({
      to: application.email,
      subject: "Update on your Berare affiliate application",
      html: `
        <p>Hi ${application.full_name},</p>
        <p>Thanks for your interest in becoming a Berare affiliate. After review, we're not able to approve your application at this time.</p>
        ${parsed.data.adminNote ? `<p>${parsed.data.adminNote}</p>` : ""}
        <p>You're welcome to apply again in the future.</p>
        <p>— Team Berare</p>
      `,
    })
  } catch (emailError) {
    console.error("Rejection email failed, rolling back rejection", applicationId, emailError)
    await supabase
      .from("affiliate_applications")
      .update({ status: "pending", admin_note: null, reviewed_by: null, reviewed_at: null })
      .eq("id", applicationId)
    return { success: false, error: "Could not send the notification email. The application was not rejected — please try again." }
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
