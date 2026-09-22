"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { requireStaff } from "@/lib/auth"
import { createServiceRoleClient } from "@berare/db/service-role"

export type SettingsActionResult = { success: true } | { success: false; error: string }

async function updateConfigValues(updates: [string, number][]): Promise<SettingsActionResult> {
  const supabase = createServiceRoleClient()
  for (const [key, value] of updates) {
    const { error } = await supabase.from("app_config").update({ value: String(value) }).eq("key", key)
    if (error) {
      return { success: false, error: "Could not save settings." }
    }
  }
  revalidatePath("/settings")
  return { success: true }
}

const affiliateSettingsSchema = z.object({
  pointsPerClick: z.coerce.number().min(0, "Must be 0 or more"),
  commissionRatePercent: z.coerce.number().min(0, "Must be 0 or more").max(100, "Must be 100 or less"),
  pointsToInrRate: z.coerce.number().positive("Must be greater than 0"),
})

export async function updateAffiliateSettings(
  input: z.infer<typeof affiliateSettingsSchema>
): Promise<SettingsActionResult> {
  await requireStaff()

  const parsed = affiliateSettingsSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" }
  }

  return updateConfigValues([
    ["points_per_click", parsed.data.pointsPerClick],
    ["commission_rate_percent", parsed.data.commissionRatePercent],
    ["points_to_inr_rate", parsed.data.pointsToInrRate],
  ])
}

const paymentSettingsSchema = z.object({
  prepaidDiscountPercent: z.coerce.number().min(0, "Must be 0 or more").max(100, "Must be 100 or less"),
  codFreeShippingThreshold: z.coerce.number().min(0, "Must be 0 or more"),
  codAdditionalCharge: z.coerce.number().min(0, "Must be 0 or more"),
})

export async function updatePaymentSettings(
  input: z.infer<typeof paymentSettingsSchema>
): Promise<SettingsActionResult> {
  await requireStaff()

  const parsed = paymentSettingsSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" }
  }

  return updateConfigValues([
    ["prepaid_discount_percent", parsed.data.prepaidDiscountPercent],
    ["cod_free_shipping_threshold", parsed.data.codFreeShippingThreshold],
    ["cod_additional_charge", parsed.data.codAdditionalCharge],
  ])
}
