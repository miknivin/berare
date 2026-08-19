import "server-only"
import { createClient } from "@supabase/supabase-js"
import type { Database } from "./types"

/**
 * Secret-key client (replaces the legacy service_role key) — bypasses RLS
 * entirely. admin app only, and only after the caller has been verified
 * against `public.staff` in the same request. Never import this in
 * storefront or affiliate app code, and never let it reach a Client
 * Component (the "server-only" import above makes any accidental
 * client-bundle inclusion a build error). Supabase itself also rejects
 * this key with a 401 if it's ever sent from a browser.
 */
export function createServiceRoleClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
