"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "@/components/ui/toast"
import { updateOrderStatus } from "@/app/(dashboard)/orders/actions"
import type { OrderStatus } from "@/lib/data/orders"

const STATUSES: OrderStatus[] = ["pending", "confirmed", "shipped", "delivered", "cancelled"]

export function OrderStatusSelect({ orderId, status }: { orderId: string; status: OrderStatus }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleChange(value: string | null) {
    if (!value) return
    startTransition(async () => {
      const result = await updateOrderStatus(orderId, value as OrderStatus)
      if (!result.success) {
        toast.error("Could not update order status", result.error)
        return
      }
      toast.success("Order status updated")
      router.refresh()
    })
  }

  return (
    <Select
      value={status}
      onValueChange={handleChange}
      disabled={isPending}
      items={STATUSES.map((s) => ({ value: s, label: s }))}
    >
      <SelectTrigger className="w-40">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {STATUSES.map((s) => (
          <SelectItem key={s} value={s}>
            {s}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
