import "server-only"
import crypto from "node:crypto"
import { NextResponse, type NextRequest } from "next/server"
import { createServiceRoleClient } from "@berare/db/service-role"

// Razorpay calls this directly (no customer session), so every DB write
// here goes through the service-role client. Signature verification is
// what stands in for auth — never trust this route's body without it.
export async function POST(request: NextRequest) {
  const rawBody = await request.text()
  const signature = request.headers.get("x-razorpay-signature")

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 })
  }

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(rawBody)
    .digest("hex")

  if (expectedSignature !== signature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  const event = JSON.parse(rawBody)
  const supabase = createServiceRoleClient()

  if (event.event === "payment.captured") {
    const payment = event.payload.payment.entity as {
      id: string
      order_id: string
    }

    const { data: order } = await supabase
      .from("orders")
      .select("id, status")
      .eq("razorpay_order_id", payment.order_id)
      .maybeSingle()

    // Idempotency: Razorpay retries webhooks until it gets a 2xx, so this
    // handler must tolerate being called more than once for the same event.
    if (order && order.status === "pending") {
      await supabase
        .from("orders")
        .update({ status: "confirmed", razorpay_payment_id: payment.id })
        .eq("id", order.id)

      // Attribution runs on payment confirmation, not on order creation —
      // rewarding an affiliate for a cart that was never paid for makes no
      // sense. Logged, never allowed to fail the webhook response.
      const { error: attributionError } = await supabase.rpc("record_affiliate_attribution", {
        p_order_id: order.id,
      })
      if (attributionError) {
        console.error("Affiliate attribution failed for order", order.id, attributionError)
      }
    }
  }

  if (event.event === "payment.failed") {
    const payment = event.payload.payment.entity as { order_id: string }
    await supabase
      .from("orders")
      .update({ status: "cancelled" })
      .eq("razorpay_order_id", payment.order_id)
      .eq("status", "pending")
  }

  // Always 200 once the signature checks out — Razorpay retries on
  // non-2xx, and we don't want a downstream hiccup to trigger a retry
  // storm for an event we've already (or will never) meaningfully handle.
  return NextResponse.json({ received: true })
}
