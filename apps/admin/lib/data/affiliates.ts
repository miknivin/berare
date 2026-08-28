import { createServiceRoleClient } from "@berare/db/service-role"

export type ApplicationStatus = "pending" | "approved" | "rejected"
export type AffiliateStatus = "active" | "suspended" | "deactivated"

export type AffiliateApplication = {
  id: string
  full_name: string
  email: string
  phone: string
  message: string | null
  status: ApplicationStatus
  admin_note: string | null
  created_at: string
}

export async function getAffiliateApplications(): Promise<AffiliateApplication[]> {
  const supabase = createServiceRoleClient()
  const { data, error } = await supabase
    .from("affiliate_applications")
    .select("id, full_name, email, phone, message, status, admin_note, created_at")
    .order("created_at", { ascending: false })

  if (error) throw error
  return data as AffiliateApplication[]
}

export type AffiliateListItem = {
  id: string
  referral_code: string
  status: AffiliateStatus
  approved_at: string
  clicks_count: number
  orders_count: number
  available_points: number
  profiles: { full_name: string | null; email: string | null } | null
}

export async function getAffiliates(): Promise<AffiliateListItem[]> {
  const supabase = createServiceRoleClient()

  const [{ data: affiliates, error }, { data: links, error: linksError }, { data: points, error: pointsError }] =
    await Promise.all([
      supabase
        .from("affiliates")
        .select("id, referral_code, status, approved_at, profiles(full_name, email)")
        .order("approved_at", { ascending: false }),
      supabase.from("affiliate_links").select("affiliate_id, clicks_count, orders_count"),
      supabase.from("points_ledger_entries").select("affiliate_id, points").eq("status", "confirmed"),
    ])

  if (error) throw error
  if (linksError) throw linksError
  if (pointsError) throw pointsError

  const clicksByAffiliate = new Map<string, number>()
  const ordersByAffiliate = new Map<string, number>()
  for (const link of links ?? []) {
    clicksByAffiliate.set(link.affiliate_id, (clicksByAffiliate.get(link.affiliate_id) ?? 0) + link.clicks_count)
    ordersByAffiliate.set(link.affiliate_id, (ordersByAffiliate.get(link.affiliate_id) ?? 0) + link.orders_count)
  }

  const pointsByAffiliate = new Map<string, number>()
  for (const entry of points ?? []) {
    pointsByAffiliate.set(entry.affiliate_id, (pointsByAffiliate.get(entry.affiliate_id) ?? 0) + Number(entry.points))
  }

  return (affiliates ?? []).map((affiliate) => ({
    ...affiliate,
    clicks_count: clicksByAffiliate.get(affiliate.id) ?? 0,
    orders_count: ordersByAffiliate.get(affiliate.id) ?? 0,
    available_points: pointsByAffiliate.get(affiliate.id) ?? 0,
  })) as AffiliateListItem[]
}
