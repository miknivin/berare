import { createServiceRoleClient } from "@berare/db/service-role"

export type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered" | "cancelled"

export type OrderListItem = {
  id: string
  status: OrderStatus
  payment_method: "razorpay" | "cod"
  total_amount: number
  created_at: string
  profiles: { email: string | null; full_name: string | null } | null
}

export type OrderDetail = OrderListItem & {
  shipping_address: {
    fullName: string
    phone: string
    addressLine1: string
    addressLine2?: string
    city: string
    state: string
    pincode: string
  }
  razorpay_order_id: string | null
  razorpay_payment_id: string | null
  order_items: {
    id: string
    quantity: number
    unit_price: number
    products: { name: string; slug: string } | null
  }[]
}

export async function getOrders(): Promise<OrderListItem[]> {
  const supabase = createServiceRoleClient()
  const { data, error } = await supabase
    .from("orders")
    .select("id, status, payment_method, total_amount, created_at, profiles(email, full_name)")
    .order("created_at", { ascending: false })

  if (error) throw error
  return data as unknown as OrderListItem[]
}

export async function getRecentOrders(limit = 10): Promise<OrderListItem[]> {
  const supabase = createServiceRoleClient()
  const { data, error } = await supabase
    .from("orders")
    .select("id, status, payment_method, total_amount, created_at, profiles(email, full_name)")
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) throw error
  return data as unknown as OrderListItem[]
}

export async function getOrderById(id: string): Promise<OrderDetail | null> {
  const supabase = createServiceRoleClient()
  const { data, error } = await supabase
    .from("orders")
    .select(
      "id, status, payment_method, total_amount, created_at, shipping_address, razorpay_order_id, razorpay_payment_id, profiles(email, full_name), order_items(id, quantity, unit_price, products(name, slug))"
    )
    .eq("id", id)
    .maybeSingle()

  if (error) throw error
  return data as unknown as OrderDetail | null
}
