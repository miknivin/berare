import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import type { Metadata } from "next"
import { ArrowLeft, Sparkles } from "lucide-react"
import { getOrderById } from "@/lib/data/orders"
import { formatPrice } from "@/lib/format"
import { getProductImageUrl } from "@/lib/image"
import { ORDER_STATUS_LABEL, ORDER_STATUS_CLASS } from "@/lib/order-status"
import { isWithinReturnWindow } from "@/lib/data/returns"

export const metadata: Metadata = { title: "Order Details" }

export default async function AccountOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const order = await getOrderById(id)
  if (!order) notFound()

  const isReturnEligible = order.status === "delivered" && isWithinReturnWindow(order.delivered_at)

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
          {order.order_items.map((item) => {
            const image = [...(item.products?.product_images ?? [])].sort((a, b) => a.position - b.position)[0]
            return (
              <li key={item.id} className="flex items-center gap-3 text-sm">
                <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-muted shrink-0">
                  {image ? (
                    <Image
                      src={getProductImageUrl(image.storage_path)}
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
                <span className="text-muted-foreground flex-1 min-w-0">
                  {item.products?.name ?? "Product"} × {item.quantity}
                </span>
                <span className="shrink-0">{formatPrice(item.unit_price * item.quantity)}</span>
              </li>
            )
          })}
        </ul>
        <div className="border-t border-border mt-4 pt-4 space-y-1.5">
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
          {order.shipping_address.country && <>, {order.shipping_address.country}</>}
          <br />
          {order.shipping_address.phone}
        </p>
      </div>

      {isReturnEligible && (
        <div className="mt-6">
          <Link
            href="/account/returns"
            className="inline-flex items-center justify-center rounded-full border border-border px-6 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
          >
            Request a Return
          </Link>
        </div>
      )}
    </div>
  )
}
