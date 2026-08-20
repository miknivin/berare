import { createServerSupabaseClient } from "@berare/db/server"

export type Profile = {
  full_name: string | null
  phone: string | null
}

export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from("profiles")
    .select("full_name, phone")
    .eq("id", user.id)
    .maybeSingle()

  if (error) throw error
  return data
}
