import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { requireStaff } from "@/lib/auth"
import { getOrderById } from "@/lib/data/orders"
import { formatPrice } from "@/lib/format"
import { OrderStatusSelect } from "@/components/orders/order-status-select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = { title: "Order Detail" }

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireStaff()
  const { id } = await params
  const order = await getOrderById(id)
  if (!order) notFound()

  return (
    <div className="max-w-3xl">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold font-mono">{order.id}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Placed{" "}
            {new Date(order.created_at).toLocaleString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}
          </p>
        </div>
        <OrderStatusSelect orderId={order.id} status={order.status} />
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <Card>
          <CardHeader>
            <CardTitle>Customer</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-1">
            <p>{order.profiles?.full_name ?? "—"}</p>
            <p className="text-muted-foreground">{order.profiles?.email ?? "—"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-1">
            <p className="uppercase">{order.payment_method}</p>
            {order.razorpay_payment_id && (
              <p className="text-muted-foreground font-mono text-xs">
                {order.razorpay_payment_id}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Shipping Address</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>{order.shipping_address.fullName}</p>
          <p>
            {order.shipping_address.addressLine1}
            {order.shipping_address.addressLine2 && `, ${order.shipping_address.addressLine2}`}
          </p>
          <p>
            {order.shipping_address.city}, {order.shipping_address.state}{" "}
            {order.shipping_address.pincode}
          </p>
          <p>{order.shipping_address.phone}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Items</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            {order.order_items.map((item) => (
              <li key={item.id} className="flex justify-between">
                <span>
                  {item.products?.name ?? "Product"} × {item.quantity}
                </span>
                <span>{formatPrice(item.unit_price * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="border-t mt-4 pt-4 flex justify-between text-sm font-medium">
            <span>Total</span>
            <span>{formatPrice(order.total_amount)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
