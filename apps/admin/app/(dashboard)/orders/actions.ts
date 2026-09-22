"use server"

import { revalidatePath } from "next/cache"
import { after } from "next/server"
import { requireStaff } from "@/lib/auth"
import { createServiceRoleClient } from "@berare/db/service-role"
import type { OrderStatus } from "@/lib/data/orders"

export type OrderActionResult = { success: true } | { success: false; error: string }

const VALID_STATUSES: OrderStatus[] = ["pending", "confirmed", "shipped", "delivered", "cancelled"]

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<OrderActionResult> {
  await requireStaff()

  if (!VALID_STATUSES.includes(status)) {
    return { success: false, error: "Invalid status" }
  }

  const supabase = createServiceRoleClient()
  // Cancelling here goes through the same order-status update the
  // Razorpay webhook uses on payment.failed — the reverse-points trigger
  // (migration 0004) fires either way, so switching an order to
  // "cancelled" from the admin app also reverses any affiliate points
  // already earned on it.
  const { error } = await supabase.from("orders").update({ status }).eq("id", id)

  if (error) {
    return { success: false, error: "Could not update order status." }
  }

  // A cancellation (or any status change touching a confirmed order)
  // logs a stock_movements row via trigger — this brings the cached
  // products.stock_quantity back in sync without making the admin wait
  // on it. Harmless no-op when the transition didn't touch stock.
  after(async () => {
    const { error: reconcileError } = await supabase.rpc("reconcile_stock_for_order", { p_order_id: id })
    if (reconcileError) {
      console.error("Stock reconciliation failed for order", id, reconcileError)
    }
  })

  revalidatePath("/orders")
  revalidatePath(`/orders/${id}`)
  return { success: true }
}
