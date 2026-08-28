"use server"

import { z } from "zod"
import { createServerSupabaseClient } from "@berare/db/server"

const applySchema = z.object({
  fullName: z.string().min(1, "Name is required"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().min(10, "Enter a valid phone number"),
  message: z.string().optional(),
})

export type ApplyResult = { success: true } | { success: false; error: string }

export async function submitAffiliateApplication(
  input: z.infer<typeof applySchema>
): Promise<ApplyResult> {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "You must be signed in to apply." }

  const parsed = applySchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" }
  }

  const { error } = await supabase.from("affiliate_applications").insert({
    applicant_id: user.id,
    full_name: parsed.data.fullName,
    email: parsed.data.email,
    phone: parsed.data.phone,
    message: parsed.data.message || null,
  })

  if (error) {
    return { success: false, error: "Could not submit your application. Please try again." }
  }

  return { success: true }
}
