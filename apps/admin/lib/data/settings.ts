import { createServiceRoleClient } from "@berare/db/service-role"

export type AffiliateSettings = {
  pointsPerClick: number
  commissionRatePercent: number
  pointsToInrRate: number
}

export type PaymentSettings = {
  prepaidDiscountPercent: number
  codFreeShippingThreshold: number
  codAdditionalCharge: number
}

const AFFILIATE_KEYS = ["points_per_click", "commission_rate_percent", "points_to_inr_rate"] as const
const PAYMENT_KEYS = ["prepaid_discount_percent", "cod_free_shipping_threshold", "cod_additional_charge"] as const

export async function getAffiliateSettings(): Promise<AffiliateSettings> {
  const supabase = createServiceRoleClient()
  const { data, error } = await supabase.from("app_config").select("key, value").in("key", AFFILIATE_KEYS)
  if (error) throw error

  const byKey = new Map((data ?? []).map((row) => [row.key, row.value]))
  return {
    pointsPerClick: Number(byKey.get("points_per_click") ?? 0),
    commissionRatePercent: Number(byKey.get("commission_rate_percent") ?? 0),
    pointsToInrRate: Number(byKey.get("points_to_inr_rate") ?? 1),
  }
}

export async function getPaymentSettings(): Promise<PaymentSettings> {
  const supabase = createServiceRoleClient()
  const { data, error } = await supabase.from("app_config").select("key, value").in("key", PAYMENT_KEYS)
  if (error) throw error

  const byKey = new Map((data ?? []).map((row) => [row.key, row.value]))
  return {
    prepaidDiscountPercent: Number(byKey.get("prepaid_discount_percent") ?? 0),
    codFreeShippingThreshold: Number(byKey.get("cod_free_shipping_threshold") ?? 0),
    codAdditionalCharge: Number(byKey.get("cod_additional_charge") ?? 0),
  }
}
