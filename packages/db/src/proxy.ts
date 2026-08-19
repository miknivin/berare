import "server-only"
import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import type { Database } from "./types"

/**
 * Refreshes the Supabase session cookie on every request. Each app's root
 * proxy.ts (Next.js's successor to middleware.ts) calls this first, then
 * layers its own auth-gating redirects on top of the returned `user`.
 *
 * Do not run code between createServerClient and auth.getClaims() — per
 * Supabase's own guidance, a mistake there can cause users to be randomly
 * logged out. And the response returned here must be passed through
 * untouched (or rebuilt from it) by the caller, or the browser and server
 * cookie state can drift out of sync.
 */
export async function updateSupabaseSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data } = await supabase.auth.getClaims()

  return { supabaseResponse, user: data?.claims ?? null }
}
