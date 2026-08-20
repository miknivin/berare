import { notFound } from "next/navigation"
import Link from "next/link"
import { CheckCircle2, Clock } from "lucide-react"
import { getOrderById } from "@/lib/data/orders"
import { formatPrice } from "@/lib/format"
import { ORDER_STATUS_LABEL, ORDER_STATUS_CLASS } from "@/lib/order-status"
import { OrderStatusPoller } from "@/components/checkout/order-status-poller"

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const order = await getOrderById(id)
  if (!order) notFound()

  const isConfirmed = order.status !== "pending"

  return (
    <div className="mx-auto max-w-2xl px-4 md:px-6 py-16">
      <OrderStatusPoller status={order.status} />

      <div className="text-center mb-10">
        {isConfirmed ? (
          <CheckCircle2 className="w-12 h-12 text-primary mx-auto mb-4" aria-hidden="true" />
        ) : (
          <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" aria-hidden="true" />
        )}
        <h1 className="font-heading text-3xl mb-2" aria-live="polite">
          {isConfirmed ? "Order Confirmed!" : "Confirming your payment…"}
        </h1>
        <p className="text-muted-foreground">
          {isConfirmed
            ? "Thank you for your purchase. We've received your order."
            : "This usually takes a few seconds. This page will update automatically."}
        </p>
        <p className="mt-4 text-sm">
          Order Number: <span className="font-medium select-all">{order.id}</span>
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {order.payment_method === "cod" ? "Cash on Delivery" : "Paid online via Razorpay"}
        </p>
        <span
          className={`inline-block mt-3 text-xs font-medium px-2.5 py-1 rounded-full ${ORDER_STATUS_CLASS[order.status] ?? "bg-muted text-muted-foreground"}`}
        >
          {ORDER_STATUS_LABEL[order.status] ?? order.status}
        </span>
      </div>

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

      <div className="rounded-xl border border-border p-6 mb-10">
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

      <Link
        href="/products"
        className="w-full min-h-12 flex items-center justify-center rounded-full bg-primary text-primary-foreground px-6 py-3 text-sm font-medium hover:bg-primary-hover transition-colors"
      >
        Continue Shopping
      </Link>
    </div>
  )
}
