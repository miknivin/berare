import { cache } from "react"
import { createServerSupabaseClient } from "@berare/db/server"

// React's cache() dedupes this within a single request — multiple Navbar
// pieces (mobile menu, desktop user icon) can each call it without
// triggering separate Supabase round trips.
export const getCurrentUser = cache(async () => {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
})
