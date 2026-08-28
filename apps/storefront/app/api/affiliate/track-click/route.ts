import "server-only"
import { NextResponse, type NextRequest } from "next/server"
import { createServerSupabaseClient } from "@berare/db/server"

// Called by middleware.ts (fire-and-forget) whenever a request carries
// ?ref=CODE. track_affiliate_click() is SECURITY DEFINER and granted to
// anon — no session required, matches an unauthenticated visitor clicking
// a shared affiliate link for the first time.
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  if (!body?.code || typeof body.code !== "string") {
    return NextResponse.json({ error: "Missing code" }, { status: 400 })
  }

  const supabase = await createServerSupabaseClient()
  const { error } = await supabase.rpc("track_affiliate_click", {
    p_code: body.code,
    p_visitor_id: typeof body.visitorId === "string" ? body.visitorId : null,
    p_user_agent: typeof body.userAgent === "string" ? body.userAgent : null,
    p_referrer: typeof body.referrer === "string" ? body.referrer : null,
    p_landing_path: typeof body.landingPath === "string" ? body.landingPath : null,
  })

  if (error) {
    // Never fail the caller over this — it's best-effort analytics, not
    // something a visitor's page load should ever be blocked or broken by.
    console.error("track_affiliate_click failed", error)
  }

  return NextResponse.json({ received: true })
}
