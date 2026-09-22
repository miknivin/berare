import { createServerSupabaseClient } from "@berare/db/server"

export type OrderDetail = {
  id: string
  status: string
  payment_method: "razorpay" | "cod"
  total_amount: number
  // Optional — orders placed before pricing settings existed won't have
  // these (default to 0 at the DB level, but old rows predate the column).
  discount_amount: number
  additional_charge: number
  delivered_at: string | null
  shipping_address: {
    fullName: string
    phone: string
    addressLine1: string
    addressLine2?: string
    city: string
    state: string
    pincode: string
    // Optional — orders placed before the country selector was added won't
    // have this.
    country?: string
  }
  created_at: string
  order_items: {
    id: string
    quantity: number
    unit_price: number
    products: {
      name: string
      slug: string
      product_images: { storage_path: string; position: number }[]
    } | null
  }[]
}

export async function getOrderById(id: string): Promise<OrderDetail | null> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from("orders")
    .select(
      "id, status, payment_method, total_amount, discount_amount, additional_charge, delivered_at, shipping_address, created_at, order_items(id, quantity, unit_price, products(name, slug, product_images(storage_path, position)))"
    )
    .eq("id", id)
    .maybeSingle()

  if (error) throw error
  return data as OrderDetail | null
}

export type OrderListItem = {
  id: string
  status: string
  payment_method: "razorpay" | "cod"
  total_amount: number
  created_at: string
}

// Uses the session-scoped client, not service-role — RLS ("orders: read
// own") is what actually keeps this safe, not the query itself.
export async function getOrdersForCurrentUser(): Promise<OrderListItem[]> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from("orders")
    .select("id, status, payment_method, total_amount, created_at")
    .order("created_at", { ascending: false })

  if (error) throw error
  return data as OrderListItem[]
}
