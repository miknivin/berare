import { createServerSupabaseClient } from "@berare/db/server"

export type AffiliateLink = {
  id: string
  code: string
  product_id: string | null
  clicks_count: number
  orders_count: number
  is_active: boolean
  created_at: string
  products: { name: string; slug: string } | null
}

export async function getMyLinks(affiliateId: string): Promise<AffiliateLink[]> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from("affiliate_links")
    .select("id, code, product_id, clicks_count, orders_count, is_active, created_at, products(name, slug)")
    .eq("affiliate_id", affiliateId)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data as unknown as AffiliateLink[]
}

export type PointsLedgerEntry = {
  id: string
  entry_type: string
  points: number
  status: string
  description: string | null
  created_at: string
}

// Safe to compute the available balance from this directly (sum of
// status='confirmed' entries) rather than calling the affiliate_available_
// points() RPC — that function has no ownership check on the affiliate_id
// it's given and isn't granted to `authenticated`, whereas this query is
// protected by the "points_ledger_entries: read own" RLS policy.
export async function getMyLedger(affiliateId: string): Promise<PointsLedgerEntry[]> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from("points_ledger_entries")
    .select("id, entry_type, points, status, description, created_at")
    .eq("affiliate_id", affiliateId)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data as PointsLedgerEntry[]
}

export function availablePointsFrom(entries: PointsLedgerEntry[]): number {
  return entries.filter((e) => e.status === "confirmed").reduce((sum, e) => sum + Number(e.points), 0)
}

export type SelectableProduct = { id: string; name: string }

export async function getActiveProducts(): Promise<SelectableProduct[]> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from("products")
    .select("id, name")
    .eq("status", "active")
    .order("name")

  if (error) throw error
  return data
}
