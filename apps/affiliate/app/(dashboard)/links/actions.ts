"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { createServerSupabaseClient } from "@berare/db/server"
import { requireActiveAffiliate } from "@/lib/auth"

const generateLinkSchema = z.object({
  productId: z.string().uuid().nullable(),
})

export type LinkActionResult = { success: true } | { success: false; error: string }

function randomSuffix() {
  return Math.random().toString(36).slice(2, 8)
}

export async function generateLink(input: z.infer<typeof generateLinkSchema>): Promise<LinkActionResult> {
  const { affiliate } = await requireActiveAffiliate()

  const parsed = generateLinkSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: "Invalid input" }
  }

  const supabase = await createServerSupabaseClient()

  // code is unique — retry with a fresh random suffix on the rare
  // collision rather than surfacing an internal detail to the affiliate.
  let insertError: { code?: string } | null = null
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = `${affiliate.referral_code}-${randomSuffix()}`
    const { error } = await supabase.from("affiliate_links").insert({
      affiliate_id: affiliate.id,
      code,
      product_id: parsed.data.productId,
    })
    if (!error) {
      insertError = null
      break
    }
    insertError = error
    if (error.code !== "23505") break
  }

  if (insertError) {
    return { success: false, error: "Could not generate link." }
  }

  revalidatePath("/links")
  return { success: true }
}
