import Link from "next/link"
import type { Metadata } from "next"
import { Package } from "lucide-react"
import { getOrdersForCurrentUser } from "@/lib/data/orders"
import { formatPrice } from "@/lib/format"
import { ORDER_STATUS_LABEL, ORDER_STATUS_CLASS } from "@/lib/order-status"

export const metadata: Metadata = { title: "Your Orders" }

export default async function OrdersPage() {
  const orders = await getOrdersForCurrentUser()

  return (
    <div>
      <h1 className="font-heading text-2xl md:text-3xl mb-8">Your Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-16 border border-border rounded-xl">
          <Package className="w-10 h-10 text-muted-foreground mx-auto mb-4" aria-hidden="true" />
          <p className="text-muted-foreground mb-6">You haven&apos;t placed any orders yet.</p>
          <Link
            href="/products"
            className="inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground px-6 py-3 text-sm font-medium hover:bg-primary-hover transition-colors"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {orders.map((order) => (
            <li key={order.id}>
              <Link
                href={`/order-confirmation/${order.id}`}
                className="flex items-center justify-between gap-4 rounded-xl border border-border p-4 hover:border-primary/40 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium font-mono">{order.id.slice(0, 8)}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(order.created_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}{" "}
                    &middot; {order.payment_method === "cod" ? "Cash on Delivery" : "Razorpay"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full ${ORDER_STATUS_CLASS[order.status] ?? "bg-muted text-muted-foreground"}`}
                  >
                    {ORDER_STATUS_LABEL[order.status] ?? order.status}
                  </span>
                  <span className="text-sm font-medium">{formatPrice(order.total_amount)}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
