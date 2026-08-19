import { updateSupabaseSession } from "@berare/db/proxy"
import { type NextRequest } from "next/server"

// No route-gating yet — account/checkout pages don't exist until Phase 3/4.
// This keeps every request's Supabase session cookie fresh in the
// meantime. Add redirects here once those pages land.
export async function proxy(request: NextRequest) {
  const { supabaseResponse } = await updateSupabaseSession(request)
  return supabaseResponse
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
