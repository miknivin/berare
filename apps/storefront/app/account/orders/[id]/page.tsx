import { notFound } from "next/navigation"
import Link from "next/link"
import type { Metadata } from "next"
import { ArrowLeft } from "lucide-react"
import { getOrderById } from "@/lib/data/orders"
import { formatPrice } from "@/lib/format"
import { ORDER_STATUS_LABEL, ORDER_STATUS_CLASS } from "@/lib/order-status"

export const metadata: Metadata = { title: "Order Details" }

export default async function AccountOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const order = await getOrderById(id)
  if (!order) notFound()

  return (
    <div>
      <Link
        href="/account/orders"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="w-4 h-4" aria-hidden="true" />
        Back to Orders
      </Link>

      <div className="flex items-center justify-between gap-4 mb-1">
        <h1 className="font-heading text-2xl md:text-3xl font-mono">{order.id.slice(0, 8)}</h1>
        <span
          className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${ORDER_STATUS_CLASS[order.status] ?? "bg-muted text-muted-foreground"}`}
        >
          {ORDER_STATUS_LABEL[order.status] ?? order.status}
        </span>
      </div>
      <p className="text-sm text-muted-foreground mb-8">
        Placed on{" "}
        {new Date(order.created_at).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })}{" "}
        &middot; {order.payment_method === "cod" ? "Cash on Delivery" : "Paid online via Razorpay"}
      </p>

      <div className="rounded-xl border border-border p-6 mb-6">
        <h2 className="text-sm font-medium mb-4">Items</h2>
        <ul className="space-y-3">
          {order.order_items.map((item) => (
            <li key={item.id} className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {item.products?.name ?? "Product"} × {item.quantity}
              </span>
              <span>{formatPrice(item.unit_price * item.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="border-t border-border mt-4 pt-4 flex justify-between text-sm font-medium">
          <span>Total</span>
          <span>{formatPrice(order.total_amount)}</span>
        </div>
      </div>

      <div className="rounded-xl border border-border p-6">
        <h2 className="text-sm font-medium mb-2">Shipping Address</h2>
        <p className="text-sm text-muted-foreground">
          {order.shipping_address.fullName}
          <br />
          {order.shipping_address.addressLine1}
          {order.shipping_address.addressLine2 && <>, {order.shipping_address.addressLine2}</>}
          <br />
          {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.pincode}
          <br />
          {order.shipping_address.phone}
        </p>
      </div>
    </div>
  )
}
