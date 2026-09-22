import { createServiceRoleClient } from "@berare/db/service-role"
import { DEFAULT_PAGE_SIZE } from "@/lib/pagination"

export type UserListItem = {
  id: string
  email: string | null
  full_name: string | null
  account_status: "active" | "disabled"
  created_at: string
}

// Dashboard's "Recent Users" widget — unrelated to the full directory below.
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

export type UserRole = "storefront" | "affiliate" | "admin"

export type UserDirectoryEntry = {
  id: string
  full_name: string | null
  email: string | null
  phone: string | null
  account_status: "active" | "disabled"
  created_at: string
  roles: UserRole[]
}

export type UserFilters = {
  /** Empty/undefined means "all roles" — no filtering. */
  roles?: UserRole[]
  search?: string
  dateFrom?: string
  dateTo?: string
}

export type PaginatedUsers = {
  users: UserDirectoryEntry[]
  total: number
  totalPages: number
}

const NO_MATCH_ID = "00000000-0000-0000-0000-000000000000"

// A profile's role is derived, not stored: "admin" if it has a staff row,
// "affiliate" if it has an affiliates row, otherwise "storefront" (a plain
// customer). Staff/affiliate overlapping with each other is vanishingly
// rare in practice but not excluded here — both tags apply if both are true.
export async function getUsers(
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE,
  filters: UserFilters = {}
): Promise<PaginatedUsers> {
  const supabase = createServiceRoleClient()

  const [{ data: affiliateRows, error: affiliateError }, { data: staffRows, error: staffError }] =
    await Promise.all([
      supabase.from("affiliates").select("profile_id"),
      supabase.from("staff").select("id"),
    ])
  if (affiliateError) throw affiliateError
  if (staffError) throw staffError

  const affiliateIds = new Set((affiliateRows ?? []).map((r) => r.profile_id))
  const staffIds = new Set((staffRows ?? []).map((r) => r.id))

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from("profiles")
    .select("id, full_name, email, phone, account_status, created_at", { count: "exact" })

  const selectedRoles = filters.roles && filters.roles.length > 0 ? new Set(filters.roles) : null
  if (selectedRoles && selectedRoles.size < 3) {
    const wantsStorefront = selectedRoles.has("storefront")
    const wantsAffiliate = selectedRoles.has("affiliate")
    const wantsAdmin = selectedRoles.has("admin")

    if (wantsStorefront && wantsAffiliate) {
      // Union = everyone except staff-only accounts.
      const ids = [...staffIds]
      if (ids.length > 0) query = query.not("id", "in", `(${ids.join(",")})`)
    } else if (wantsStorefront && wantsAdmin) {
      const ids = [...affiliateIds]
      if (ids.length > 0) query = query.not("id", "in", `(${ids.join(",")})`)
    } else if (wantsAffiliate && wantsAdmin) {
      const ids = [...new Set([...affiliateIds, ...staffIds])]
      query = query.in("id", ids.length > 0 ? ids : [NO_MATCH_ID])
    } else if (wantsStorefront) {
      const ids = [...new Set([...affiliateIds, ...staffIds])]
      if (ids.length > 0) query = query.not("id", "in", `(${ids.join(",")})`)
    } else if (wantsAffiliate) {
      const ids = [...affiliateIds]
      query = query.in("id", ids.length > 0 ? ids : [NO_MATCH_ID])
    } else if (wantsAdmin) {
      const ids = [...staffIds]
      query = query.in("id", ids.length > 0 ? ids : [NO_MATCH_ID])
    }
  }

  if (filters.search) {
    const term = filters.search.replace(/[%,]/g, "")
    query = query.or(`full_name.ilike.%${term}%,email.ilike.%${term}%`)
  }
  if (filters.dateFrom) query = query.gte("created_at", filters.dateFrom)
  if (filters.dateTo) query = query.lte("created_at", `${filters.dateTo}T23:59:59.999`)

  const { data, error, count } = await query.order("created_at", { ascending: false }).range(from, to)
  if (error) throw error

  const users: UserDirectoryEntry[] = ((data ?? []) as Omit<UserDirectoryEntry, "roles">[]).map((profile) => {
    const roles: UserRole[] = []
    if (staffIds.has(profile.id)) roles.push("admin")
    if (affiliateIds.has(profile.id)) roles.push("affiliate")
    if (roles.length === 0) roles.push("storefront")
    return { ...profile, roles }
  })

  const total = count ?? 0
  return { users, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) }
}
