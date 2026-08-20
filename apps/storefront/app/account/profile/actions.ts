"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { createServerSupabaseClient } from "@berare/db/server"

const profileInputSchema = z.object({
  fullName: z.string().min(1, "Name is required").max(200),
  phone: z.string().max(20).optional(),
})

export type ProfileActionResult = { success: true } | { success: false; error: string }

export async function updateProfile(
  input: z.infer<typeof profileInputSchema>
): Promise<ProfileActionResult> {
  const parsed = profileInputSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" }
  }

  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: "Not signed in." }
  }

  // "profiles: update own" RLS policy is what actually enforces this is
  // the signed-in user's own row — the .eq() here is belt-and-suspenders.
  const { error } = await supabase
    .from("profiles")
    .update({ full_name: parsed.data.fullName, phone: parsed.data.phone || null })
    .eq("id", user.id)

  if (error) {
    return { success: false, error: "Could not update profile." }
  }

  revalidatePath("/account")
  revalidatePath("/account/profile")
  return { success: true }
}
