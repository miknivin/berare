import "server-only"
import { createClient } from "@supabase/supabase-js"
import type { Database } from "./types"

/**
 * Publishable-key client for anonymous-readable, cacheable reads (product
 * catalog, categories, banners). Unlike `createServerSupabaseClient`, this
 * never touches `next/headers` cookies, so it's safe to call inside
 * `unstable_cache` (which forbids Dynamic APIs) or during static rendering.
 * RLS still applies at the same privilege level as a signed-out visitor —
 * never use this for anything user- or session-specific.
 */
export function createPublicSupabaseClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
