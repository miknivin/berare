import { updateSupabaseSession } from "@berare/db/proxy"
import { type NextRequest } from "next/server"

// Full affiliate-status gating (redirect to "apply" if not an active
// affiliate) is Phase 6, once the affiliate application/approval flow
// exists. For now this only keeps the session cookie fresh.
export async function proxy(request: NextRequest) {
  const { supabaseResponse } = await updateSupabaseSession(request)
  return supabaseResponse
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
