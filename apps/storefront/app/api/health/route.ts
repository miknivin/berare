import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@berare/db/server"

// Hit by a scheduled GitHub Actions workflow every 15 minutes to keep the
// free-tier Supabase project from auto-pausing after a week of inactivity.
// Queries `products` specifically because it's publicly readable (no auth
// round-trip needed) and real database activity, not just an API ping.
export async function GET() {
  const supabase = await createServerSupabaseClient()
  const { error } = await supabase.from("products").select("id").limit(1)

  if (error) {
    return NextResponse.json({ ok: false }, { status: 503 })
  }

  return NextResponse.json({ ok: true })
}
