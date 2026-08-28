import { updateSupabaseSession } from "@berare/db/proxy"
import { type NextRequest, type NextFetchEvent } from "next/server"
import {
  AFFILIATE_REF_QUERY_PARAM,
  AFFILIATE_REF_COOKIE_NAME,
  AFFILIATE_VISITOR_COOKIE_NAME,
} from "@berare/shared"

// Matches app_config's attribution_window_days placeholder (30) — update
// this alongside that value if it's ever changed, no DB round-trip here
// to keep proxy fast on every request.
const REF_COOKIE_MAX_AGE = 60 * 60 * 24 * 30
const VISITOR_COOKIE_MAX_AGE = 60 * 60 * 24 * 365

export async function proxy(request: NextRequest, event: NextFetchEvent) {
  const { supabaseResponse } = await updateSupabaseSession(request)

  const code = request.nextUrl.searchParams.get(AFFILIATE_REF_QUERY_PARAM)

  let visitorId = request.cookies.get(AFFILIATE_VISITOR_COOKIE_NAME)?.value
  if (!visitorId) {
    visitorId = crypto.randomUUID()
    supabaseResponse.cookies.set(AFFILIATE_VISITOR_COOKIE_NAME, visitorId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: VISITOR_COOKIE_MAX_AGE,
      path: "/",
    })
  }

  if (code) {
    // Last-click-wins: a new ?ref= always overwrites whatever was there.
    supabaseResponse.cookies.set(AFFILIATE_REF_COOKIE_NAME, code, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: REF_COOKIE_MAX_AGE,
      path: "/",
    })

    const trackUrl = new URL("/api/affiliate/track-click", request.url)
    // Fire-and-forget — never block the page response on this. waitUntil
    // keeps it alive past the response in the Edge runtime.
    event.waitUntil(
      fetch(trackUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          visitorId,
          userAgent: request.headers.get("user-agent"),
          referrer: request.headers.get("referer"),
          landingPath: request.nextUrl.pathname,
        }),
      }).catch(() => {})
    )
  }

  return supabaseResponse
}

export const config = {
  matcher:
    "/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
}
