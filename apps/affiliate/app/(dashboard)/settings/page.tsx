import type { Metadata } from "next"
import { requireActiveAffiliate } from "@/lib/auth"
import { getMyLedger, getMyWithdrawals, availablePointsFrom } from "@/lib/data/affiliate"
import { MIN_WITHDRAWAL_POINTS } from "@/lib/withdrawal"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BankDetailsForm } from "@/components/settings/bank-details-form"
import { WithdrawalRequestForm } from "@/components/settings/withdrawal-request-form"

export const metadata: Metadata = { title: "Settings" }

const STATUS_VARIANT = {
  requested: "secondary",
  approved: "default",
  paid: "default",
  rejected: "destructive",
} as const

export default async function SettingsPage() {
  const { affiliate } = await requireActiveAffiliate()
  const [ledger, withdrawals] = await Promise.all([
    getMyLedger(affiliate.id),
    getMyWithdrawals(affiliate.id),
  ])
  const availablePoints = availablePointsFrom(ledger)

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-xl font-semibold mb-1">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your payout details and withdrawals.</p>
      </div>

      <section>
        <h2 className="text-sm font-medium mb-3">Bank Details</h2>
        <BankDetailsForm payoutDetails={affiliate.payout_details} />
      </section>

      <section>
        <h2 className="text-sm font-medium mb-3">Request a Withdrawal</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Available balance: <span className="font-semibold text-foreground">{availablePoints} points</span>
        </p>

        {!affiliate.payout_details ? (
          <p className="text-sm text-muted-foreground">Add your bank details above to request a withdrawal.</p>
        ) : availablePoints < MIN_WITHDRAWAL_POINTS ? (
          <p className="text-sm text-muted-foreground">
            You need at least {MIN_WITHDRAWAL_POINTS} points to request a withdrawal (currently {availablePoints}).
          </p>
        ) : (
          <WithdrawalRequestForm availablePoints={availablePoints} />
        )}
      </section>

      <section>
        <h2 className="text-sm font-medium mb-3">Withdrawal History</h2>
        {withdrawals.length === 0 ? (
          <p className="text-sm text-muted-foreground">No withdrawal requests yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Points</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Requested</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {withdrawals.map((withdrawal) => (
                <TableRow key={withdrawal.id}>
                  <TableCell>{withdrawal.points_requested}</TableCell>
                  <TableCell>₹{withdrawal.amount_requested}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[withdrawal.status]}>{withdrawal.status}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {withdrawal.payout_reference ?? "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {new Date(withdrawal.created_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </section>
    </div>
  )
}
