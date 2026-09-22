import { createServerSupabaseClient } from "@berare/db/server"

export const RETURN_WINDOW_DAYS = 7

export function isWithinReturnWindow(deliveredAt: string | null): boolean {
  if (!deliveredAt) return false
  return Date.now() - new Date(deliveredAt).getTime() <= RETURN_WINDOW_DAYS * 24 * 60 * 60 * 1000
}

export type ReturnRequest = {
  id: string
  order_id: string
  reason: string
  message: string | null
  status: "requested" | "accepted" | "rejected" | "completed"
  admin_note: string | null
  created_at: string
}

// Uses the session-scoped client — RLS ("return_requests: read own") is
// what actually keeps this safe, not the query itself.
export async function getMyReturnRequests(): Promise<ReturnRequest[]> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from("return_requests")
    .select("id, order_id, reason, message, status, admin_note, created_at")
    .order("created_at", { ascending: false })

  if (error) throw error
  return data as ReturnRequest[]
}

export type ReturnEligibleOrder = {
  id: string
  total_amount: number
  delivered_at: string
}

// Delivered, within the return window, and not already carrying an active
// (requested/accepted) return — mirrors validate_return_request()'s DB-level
// checks so the picker only ever offers orders that will actually succeed.
export async function getReturnEligibleOrders(): Promise<ReturnEligibleOrder[]> {
  const supabase = await createServerSupabaseClient()
  const cutoff = new Date(Date.now() - RETURN_WINDOW_DAYS * 24 * 60 * 60 * 1000).toISOString()

  const { data, error } = await supabase
    .from("orders")
    .select("id, total_amount, delivered_at")
    .eq("status", "delivered")
    .gte("delivered_at", cutoff)
    .order("delivered_at", { ascending: false })

  if (error) throw error
  return (data ?? []) as ReturnEligibleOrder[]
}
