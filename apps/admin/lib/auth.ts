import "server-only"
import { redirect } from "next/navigation"
import { createServerSupabaseClient } from "@berare/db/server"

/**
 * Call at the top of every protected admin Server Component / Route
 * Handler. Redirects to /auth/login if there's no session, or if the
 * session belongs to a real Supabase user who just isn't staff (e.g. a
 * storefront customer's account) — per plan §3, admin data access always
 * goes through this check before any service-role query runs.
 */
export async function requireStaff() {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // RLS's "staff: read own" policy scopes this to the caller's own row —
  // this is the ordinary server client, not service-role.
  const { data: staff } = await supabase
    .from("staff")
    .select("id, role")
    .eq("id", user.id)
    .maybeSingle()

  if (!staff) {
    await supabase.auth.signOut()
    redirect("/auth/login?error=" + encodeURIComponent("This account doesn't have admin access."))
  }

  return { user, staff }
}
