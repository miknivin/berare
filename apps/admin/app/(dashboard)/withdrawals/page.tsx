import type { Metadata } from "next"
import { requireStaff } from "@/lib/auth"
import { getWithdrawals } from "@/lib/data/withdrawals"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { WithdrawalStatusActions } from "@/components/withdrawals/withdrawal-status-actions"
import { PaginationNav } from "@/components/shared/pagination-nav"
import { PageSizeSelect } from "@/components/shared/page-size-select"
import { DEFAULT_PAGE_SIZE, parsePageSize } from "@/lib/pagination"

export const metadata: Metadata = { title: "Withdrawals" }

const STATUS_VARIANT = {
  requested: "secondary",
  approved: "default",
  paid: "default",
  rejected: "destructive",
} as const

export default async function WithdrawalsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; pageSize?: string }>
}) {
  await requireStaff()
  const { page: pageParam, pageSize: pageSizeParam } = await searchParams
  const page = Math.max(1, Number(pageParam) || 1)
  const pageSize = parsePageSize(pageSizeParam)

  const { withdrawals, total, totalPages } = await getWithdrawals(page, pageSize)

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold">Withdrawals</h1>
        <p className="text-sm text-muted-foreground">{total} withdrawal requests</p>
      </div>

      <div className="flex justify-end mb-3">
        <PageSizeSelect pageSize={pageSize} basePath="/withdrawals" defaultPageSize={DEFAULT_PAGE_SIZE} />
      </div>

      {withdrawals.length === 0 ? (
        <p className="text-sm text-muted-foreground">No withdrawal requests yet.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Affiliate</TableHead>
              <TableHead>Bank Details</TableHead>
              <TableHead>Points</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Reference</TableHead>
              <TableHead>Requested</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {withdrawals.map((withdrawal) => {
              const payout = withdrawal.affiliates?.payout_details
              return (
                <TableRow key={withdrawal.id}>
                  <TableCell>
                    <div className="font-medium">
                      {withdrawal.affiliates?.profiles?.full_name ??
                        withdrawal.affiliates?.profiles?.email ??
                        "—"}
                    </div>
                    <div className="text-xs text-muted-foreground font-mono">
                      {withdrawal.affiliates?.referral_code}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {payout ? (
                      <>
                        {payout.accountHolderName}
                        <br />
                        {payout.accountNumber} &middot; {payout.ifscCode}
                      </>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell>{withdrawal.points_requested}</TableCell>
                  <TableCell>₹{withdrawal.amount_requested}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[withdrawal.status]}>{withdrawal.status}</Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {withdrawal.payout_reference ?? "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(withdrawal.created_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <WithdrawalStatusActions id={withdrawal.id} status={withdrawal.status} />
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      )}

      <PaginationNav
        page={page}
        totalPages={totalPages}
        basePath="/withdrawals"
        pageSize={pageSize}
        defaultPageSize={DEFAULT_PAGE_SIZE}
      />
    </div>
  )
}
