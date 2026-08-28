import type { Metadata } from "next"
import { requireActiveAffiliate } from "@/lib/auth"
import { getMyLedger, availablePointsFrom } from "@/lib/data/affiliate"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export const metadata: Metadata = { title: "Earnings" }

const STATUS_VARIANT = {
  pending: "secondary",
  confirmed: "default",
  reversed: "destructive",
} as const

export default async function EarningsPage() {
  const { affiliate } = await requireActiveAffiliate()
  const ledger = await getMyLedger(affiliate.id)
  const availablePoints = availablePointsFrom(ledger)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">Earnings</h1>
        <p className="text-sm text-muted-foreground">
          Available balance: <span className="font-semibold text-foreground">{availablePoints} points</span>
        </p>
      </div>

      {ledger.length === 0 ? (
        <p className="text-sm text-muted-foreground">No earnings yet — share your links to start earning.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Description</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Points</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ledger.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell className="text-sm">{entry.description ?? "—"}</TableCell>
                <TableCell className="capitalize text-sm text-muted-foreground">{entry.entry_type}</TableCell>
                <TableCell className={entry.points < 0 ? "text-destructive" : ""}>
                  {entry.points > 0 ? "+" : ""}
                  {entry.points}
                </TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[entry.status as keyof typeof STATUS_VARIANT] ?? "secondary"}>
                    {entry.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {new Date(entry.created_at).toLocaleDateString("en-IN", {
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
    </div>
  )
}
