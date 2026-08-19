import { updateSupabaseSession } from "@berare/db/proxy"
import { NextResponse, type NextRequest } from "next/server"

// Unlike storefront/affiliate, nothing in the admin app is public — every
// page requires a session. This only checks session *existence*; the
// staff-table membership check (requireStaff()) happens per-request in
// Server Components/Route Handlers, not here, to avoid a DB round-trip on
// every proxy invocation.
export async function proxy(request: NextRequest) {
  const { supabaseResponse, user } = await updateSupabaseSession(request)

  const isAuthRoute = request.nextUrl.pathname.startsWith("/auth")
  if (!user && !isAuthRoute) {
    const url = request.nextUrl.clone()
    url.pathname = "/auth/login"
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
