import type { Metadata } from "next"
import { requireStaff } from "@/lib/auth"
import { getReturnRequests } from "@/lib/data/returns"
import { formatPrice } from "@/lib/format"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ReturnRequestActions } from "@/components/returns/return-request-actions"

export const metadata: Metadata = { title: "Returns" }

const STATUS_VARIANT = {
  requested: "secondary",
  accepted: "default",
  rejected: "destructive",
  completed: "outline",
} as const

const REASON_LABEL: Record<string, string> = {
  damaged: "Damaged/leaking",
  wrong_item: "Wrong item",
  missing_item: "Item missing",
  expired: "Expired",
  changed_mind: "Changed mind",
  other: "Other",
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
}

export default async function ReturnsPage() {
  await requireStaff()
  const requests = await getReturnRequests()

  const pendingCount = requests.filter((r) => r.status === "requested").length

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold">Returns</h1>
        <p className="text-sm text-muted-foreground">
          {requests.length} return requests &middot; {pendingCount} awaiting review
        </p>
      </div>

      {requests.length === 0 ? (
        <p className="text-sm text-muted-foreground">No return requests yet.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Requested</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((request) => (
              <TableRow key={request.id}>
                <TableCell className="font-mono text-xs">{request.order_id.slice(0, 8)}</TableCell>
                <TableCell>
                  {request.profiles?.full_name ?? request.profiles?.email ?? "—"}
                </TableCell>
                <TableCell className="text-muted-foreground text-xs max-w-60">
                  <div>{REASON_LABEL[request.reason] ?? request.reason}</div>
                  {request.message && <div className="truncate">{request.message}</div>}
                </TableCell>
                <TableCell>{request.orders ? formatPrice(request.orders.total_amount) : "—"}</TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[request.status]}>{request.status}</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">{formatDate(request.created_at)}</TableCell>
                <TableCell className="text-right">
                  <ReturnRequestActions id={request.id} status={request.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
