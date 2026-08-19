import { createBrowserClient as createSupabaseBrowserClient } from "@supabase/ssr"
import type { Database } from "./types"

/**
 * Publishable-key client for Client Components (replaces the legacy anon
 * key — same low privilege level). RLS applies — this can only see what
 * the signed-in user (or an anonymous visitor) is allowed to see.
 */
export function createBrowserClient() {
  return createSupabaseBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  )
}
