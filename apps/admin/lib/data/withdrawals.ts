import { createServiceRoleClient } from "@berare/db/service-role"
import { DEFAULT_PAGE_SIZE } from "@/lib/pagination"

export type WithdrawalStatus = "requested" | "approved" | "rejected" | "paid"

export type PayoutDetails = {
  accountHolderName: string
  accountNumber: string
  ifscCode: string
}

export type WithdrawalListItem = {
  id: string
  points_requested: number
  amount_requested: number
  status: WithdrawalStatus
  payout_reference: string | null
  admin_note: string | null
  created_at: string
  affiliates: {
    referral_code: string
    payout_details: PayoutDetails | null
    profiles: { full_name: string | null; email: string | null } | null
  } | null
}

export type PaginatedWithdrawals = {
  withdrawals: WithdrawalListItem[]
  total: number
  totalPages: number
}

// No RLS scoping needed — the admin app only ever calls this after
// requireStaff() has already gated the page, using the service-role client
// to see every affiliate's requests (the affiliate-facing RLS policy only
// permits reading one's own).
export async function getWithdrawals(page = 1, pageSize = DEFAULT_PAGE_SIZE): Promise<PaginatedWithdrawals> {
  const supabase = createServiceRoleClient()
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const { data, error, count } = await supabase
    .from("withdrawal_requests")
    .select(
      "id, points_requested, amount_requested, status, payout_reference, admin_note, created_at, affiliates(referral_code, payout_details, profiles(full_name, email))",
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(from, to)

  if (error) throw error

  const total = count ?? 0
  return {
    withdrawals: data as unknown as WithdrawalListItem[],
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  }
}
