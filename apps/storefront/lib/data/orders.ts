import { createServerSupabaseClient } from "@berare/db/server"

export type OrderDetail = {
  id: string
  status: string
  payment_method: "razorpay" | "cod"
  total_amount: number
  shipping_address: {
    fullName: string
    phone: string
    addressLine1: string
    addressLine2?: string
    city: string
    state: string
    pincode: string
  }
  created_at: string
  order_items: {
    id: string
    quantity: number
    unit_price: number
    products: { name: string; slug: string } | null
  }[]
}

export async function getOrderById(id: string): Promise<OrderDetail | null> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from("orders")
    .select(
      "id, status, payment_method, total_amount, shipping_address, created_at, order_items(id, quantity, unit_price, products(name, slug))"
    )
    .eq("id", id)
    .maybeSingle()

  if (error) throw error
  return data as OrderDetail | null
}
