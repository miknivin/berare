import { createServiceRoleClient } from "@berare/db/service-role"

export type UserListItem = {
  id: string
  email: string | null
  full_name: string | null
  account_status: "active" | "disabled"
  created_at: string
}

export async function getRecentUsers(limit = 10): Promise<UserListItem[]> {
  const supabase = createServiceRoleClient()
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, account_status, created_at")
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) throw error
  return data as UserListItem[]
}
