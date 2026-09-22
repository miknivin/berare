import { createServiceRoleClient } from "@berare/db/service-role"

export type ReturnStatus = "requested" | "accepted" | "rejected" | "completed"

export type ReturnRequestListItem = {
  id: string
  order_id: string
  reason: string
  message: string | null
  status: ReturnStatus
  admin_note: string | null
  created_at: string
  orders: { total_amount: number; payment_method: "razorpay" | "cod" } | null
  profiles: { full_name: string | null; email: string | null } | null
}

export async function getReturnRequests(): Promise<ReturnRequestListItem[]> {
  const supabase = createServiceRoleClient()
  const { data, error } = await supabase
    .from("return_requests")
    .select(
      "id, order_id, reason, message, status, admin_note, created_at, orders(total_amount, payment_method), profiles(full_name, email)"
    )
    .order("created_at", { ascending: false })

  if (error) throw error
  return data as unknown as ReturnRequestListItem[]
}
