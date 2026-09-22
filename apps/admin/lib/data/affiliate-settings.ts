import { createServiceRoleClient } from "@berare/db/service-role"

export type AffiliateSettings = {
  pointsPerClick: number
  commissionRatePercent: number
  pointsToInrRate: number
}

const KEYS = ["points_per_click", "commission_rate_percent", "points_to_inr_rate"] as const

export async function getAffiliateSettings(): Promise<AffiliateSettings> {
  const supabase = createServiceRoleClient()
  const { data, error } = await supabase.from("app_config").select("key, value").in("key", KEYS)
  if (error) throw error

  const byKey = new Map((data ?? []).map((row) => [row.key, row.value]))
  return {
    pointsPerClick: Number(byKey.get("points_per_click") ?? 0),
    commissionRatePercent: Number(byKey.get("commission_rate_percent") ?? 0),
    pointsToInrRate: Number(byKey.get("points_to_inr_rate") ?? 1),
  }
}
