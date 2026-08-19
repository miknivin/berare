import Link from "next/link"
import type { Metadata } from "next"
import { requireStaff } from "@/lib/auth"
import { getOrders } from "@/lib/data/orders"
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

export const metadata: Metadata = { title: "Orders" }

const STATUS_VARIANT = {
  pending: "secondary",
  confirmed: "default",
  shipped: "default",
  delivered: "default",
  cancelled: "destructive",
} as const

export default async function OrdersPage() {
  await requireStaff()
  const orders = await getOrders()

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold">Orders</h1>
        <p className="text-sm text-muted-foreground">{orders.length} orders</p>
      </div>

      {orders.length === 0 ? (
        <p className="text-sm text-muted-foreground">No orders yet.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Placed</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-mono text-xs">
                  <Link href={`/orders/${order.id}`} className="hover:underline">
                    {order.id.slice(0, 8)}
                  </Link>
                </TableCell>
                <TableCell>
                  {order.profiles?.full_name ?? order.profiles?.email ?? "—"}
                </TableCell>
                <TableCell className="uppercase text-xs text-muted-foreground">
                  {order.payment_method}
                </TableCell>
                <TableCell>{formatPrice(order.total_amount)}</TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[order.status]}>{order.status}</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {new Date(order.created_at).toLocaleDateString("en-IN", {
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
