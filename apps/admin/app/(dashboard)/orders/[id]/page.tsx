import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import type { Metadata } from "next"
import { ArrowLeft, Sparkles } from "lucide-react"
import { requireStaff } from "@/lib/auth"
import { getOrderById } from "@/lib/data/orders"
import { formatPrice } from "@/lib/format"
import { getPublicUrl } from "@/lib/s3"
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
      <Link
        href="/orders"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft className="w-4 h-4" aria-hidden="true" />
        Back to Orders
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold font-mono">{order.id.slice(0, 8)}</h1>
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
            {order.shipping_address.country && `, ${order.shipping_address.country}`}
          </p>
          <p>{order.shipping_address.phone}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Items</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3 text-sm">
            {order.order_items.map((item) => {
              const image = [...(item.products?.product_images ?? [])].sort((a, b) => a.position - b.position)[0]
              return (
                <li key={item.id} className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-muted shrink-0">
                    {image ? (
                      <Image
                        src={getPublicUrl(image.storage_path)}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <Sparkles className="w-4 h-4 opacity-40" aria-hidden="true" />
                      </div>
                    )}
                  </div>
                  <span className="flex-1 min-w-0">
                    {item.products?.name ?? "Product"} × {item.quantity}
                  </span>
                  <span className="shrink-0">{formatPrice(item.unit_price * item.quantity)}</span>
                </li>
              )
            })}
          </ul>
          <div className="border-t mt-4 pt-4 space-y-1.5">
            {order.discount_amount > 0 && (
              <div className="flex justify-between text-sm text-green-700">
                <span>Prepaid discount</span>
                <span>−{formatPrice(order.discount_amount)}</span>
              </div>
            )}
            {order.additional_charge > 0 && (
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>COD charge</span>
                <span>{formatPrice(order.additional_charge)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-medium">
              <span>Total</span>
              <span>{formatPrice(order.total_amount)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
