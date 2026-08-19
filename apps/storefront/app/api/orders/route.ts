import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"
import { cookies } from "next/headers"
import { createServerSupabaseClient } from "@berare/db/server"
import { getRazorpayClient } from "@/lib/razorpay"
import { AFFILIATE_REF_COOKIE_NAME } from "@berare/shared"

const orderRequestSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.number().int().min(1).max(20),
      })
    )
    .min(1),
  shippingAddress: z.object({
    fullName: z.string().min(1),
    phone: z.string().min(10).max(15),
    addressLine1: z.string().min(1),
    addressLine2: z.string().optional(),
    city: z.string().min(1),
    state: z.string().min(1),
    pincode: z.string().min(6).max(6),
  }),
  paymentMethod: z.enum(["razorpay", "cod"]),
})

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const parsed = orderRequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 })
  }

  const { items, shippingAddress, paymentMethod } = parsed.data

  // Never trust client-submitted prices — re-fetch current prices for
  // every item and reject anything that's missing or no longer active.
  const productIds = items.map((i) => i.productId)
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("id, price, status")
    .in("id", productIds)

  if (productsError) {
    return NextResponse.json({ error: "Could not verify products" }, { status: 500 })
  }

  const productById = new Map(products?.map((p) => [p.id, p]) ?? [])
  for (const item of items) {
    const product = productById.get(item.productId)
    if (!product || product.status !== "active") {
      return NextResponse.json(
        { error: "One or more items in your cart are no longer available." },
        { status: 409 }
      )
    }
  }

  const totalAmount = items.reduce((sum, item) => {
    const product = productById.get(item.productId)!
    return sum + product.price * item.quantity
  }, 0)

  const cookieStore = await cookies()
  const affiliateRefCode = cookieStore.get(AFFILIATE_REF_COOKIE_NAME)?.value ?? null

  // Razorpay orders are created BEFORE the local insert, so the row below
  // can include razorpay_order_id in one shot — there's deliberately no
  // RLS UPDATE policy on orders for customers (status transitions only
  // happen server-side via the webhook/admin app), so insert-then-update
  // would fail. COD has no gateway step, so this only runs for razorpay.
  let razorpayOrderId: string | null = null
  if (paymentMethod === "razorpay") {
    const razorpay = getRazorpayClient()
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100), // paise
      currency: "INR",
      receipt: crypto.randomUUID(),
    })
    razorpayOrderId = razorpayOrder.id
  }

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      customer_id: user.id,
      // Razorpay orders start pending until the webhook confirms payment;
      // COD has no payment gateway step, so it's confirmed immediately.
      status: paymentMethod === "cod" ? "confirmed" : "pending",
      total_amount: totalAmount,
      shipping_address: shippingAddress,
      affiliate_ref_code: affiliateRefCode,
      payment_method: paymentMethod,
      razorpay_order_id: razorpayOrderId,
    })
    .select("id")
    .single()

  if (orderError || !order) {
    return NextResponse.json({ error: "Could not create order" }, { status: 500 })
  }

  const orderItemRows = items.map((item) => ({
    order_id: order.id,
    product_id: item.productId,
    quantity: item.quantity,
    unit_price: productById.get(item.productId)!.price,
  }))

  const { error: itemsError } = await supabase.from("order_items").insert(orderItemRows)
  if (itemsError) {
    return NextResponse.json({ error: "Could not create order items" }, { status: 500 })
  }

  if (paymentMethod === "cod") {
    // No webhook for COD — attribute now, as the authenticated customer
    // (record_affiliate_attribution's ownership guard allows a caller to
    // attribute their own order; it's the service-role/webhook path that
    // skips the check, not this one).
    const { error: attributionError } = await supabase.rpc("record_affiliate_attribution", {
      p_order_id: order.id,
    })
    if (attributionError) {
      console.error("Affiliate attribution failed for COD order", order.id, attributionError)
    }

    return NextResponse.json({ orderId: order.id, paymentMethod: "cod" as const })
  }

  return NextResponse.json({
    orderId: order.id,
    paymentMethod: "razorpay" as const,
    razorpayOrderId,
    amount: Math.round(totalAmount * 100),
    currency: "INR",
    keyId: process.env.RAZORPAY_KEY_ID,
    prefillEmail: user.email,
    prefillName: shippingAddress.fullName,
    prefillContact: shippingAddress.phone,
  })
}
