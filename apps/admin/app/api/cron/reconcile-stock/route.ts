import "server-only"
import { NextResponse, type NextRequest } from "next/server"
import { createServiceRoleClient } from "@berare/db/service-role"

// Vercel Cron calls this once a day (see vercel.json) to catch any product
// whose cached stock_quantity has drifted from the stock_movements ledger —
// the backstop for the fire-and-forget reconcile calls that run right after
// each order, in case one of those never completed (a crash, a cold start
// killed before its `after()` ran, etc). Reconciling here is the "check"
// the request asked for: reconcile_product_stock(null) recomputes every
// product's stock_quantity from the ledger, so this both detects and
// fixes drift in the same call.
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = createServiceRoleClient()
  const { data, error } = await supabase.rpc("reconcile_product_stock", {})

  if (error) {
    console.error("Daily stock reconciliation failed", error)
    return NextResponse.json({ error: "Reconciliation failed" }, { status: 500 })
  }

  const corrected = data ?? []
  if (corrected.length > 0) {
    console.warn("Stock reconciliation corrected drift", corrected)
  }

  return NextResponse.json({
    checkedAt: new Date().toISOString(),
    correctedCount: corrected.length,
    corrected,
  })
}
