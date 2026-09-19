import { createServiceRoleClient } from "@berare/db/service-role"
import { DEFAULT_PAGE_SIZE } from "@/lib/pagination"

export type Enquiry = {
  id: string
  name: string
  phone: string | null
  email: string | null
  message: string | null
  source: string | null
  created_at: string
}

export type PaginatedEnquiries = {
  enquiries: Enquiry[]
  total: number
  totalPages: number
}

// No RLS scoping needed here — the admin app only ever calls this after
// requireStaff() has already gated the page, and the enquiries table has no
// select policy at all (public insert only), so reading it requires the
// service-role client regardless.
export async function getEnquiries(page = 1, pageSize = DEFAULT_PAGE_SIZE): Promise<PaginatedEnquiries> {
  const supabase = createServiceRoleClient()
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const { data, error, count } = await supabase
    .from("enquiries")
    .select("id, name, phone, email, message, source, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to)

  if (error) throw error

  const total = count ?? 0
  return {
    enquiries: data as Enquiry[],
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  }
}
