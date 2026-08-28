import "server-only"
import { redirect } from "next/navigation"
import { createServerSupabaseClient } from "@berare/db/server"

export type AffiliateRecord = {
  id: string
  referral_code: string
  status: "active" | "suspended" | "deactivated"
}

/**
 * Gate for every page under (dashboard). Redirects to `/` (the app's own
 * landing/status page) unless the signed-in user has an *active* affiliate
 * record — a pending application, a rejected one, or a suspended/deactivated
 * affiliate all land back there instead of the real dashboard shell.
 */
export async function requireActiveAffiliate() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/")
  }

  const { data: affiliate } = await supabase
    .from("affiliates")
    .select("id, referral_code, status")
    .eq("profile_id", user.id)
    .maybeSingle()

  if (!affiliate || affiliate.status !== "active") {
    redirect("/")
  }

  return { user, affiliate: affiliate as AffiliateRecord }
}
