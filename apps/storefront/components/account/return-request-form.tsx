"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { formatPrice } from "@/lib/format"
import { submitReturnRequest } from "@/app/account/returns/actions"
import type { ReturnEligibleOrder } from "@/lib/data/returns"

const REASON_OPTIONS = [
  { value: "damaged", label: "Product received damaged or leaking" },
  { value: "wrong_item", label: "Wrong product or shade delivered" },
  { value: "missing_item", label: "Item missing from my order" },
  { value: "expired", label: "Product is expired or near expiry" },
  { value: "changed_mind", label: "Unopened, changed my mind" },
  { value: "other", label: "Other" },
] as const

export function ReturnRequestForm({ orders }: { orders: ReturnEligibleOrder[] }) {
  const router = useRouter()
  const [orderId, setOrderId] = useState(orders[0]?.id ?? "")
  const [reason, setReason] = useState<(typeof REASON_OPTIONS)[number]["value"]>("damaged")
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)
    const result = await submitReturnRequest({ orderId, reason, message: message || undefined })
    setIsSubmitting(false)
    if (!result.success) {
      setError(result.error)
      return
    }
    setSubmitted(true)
    router.refresh()
  }

  if (orders.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No orders are currently eligible for return — only orders delivered within the last 7 days qualify.
      </p>
    )
  }

  if (submitted) {
    return (
      <div className="rounded-xl border border-border p-6 text-center">
        <p className="font-medium mb-2">Return request submitted</p>
        <p className="text-sm text-muted-foreground">We&apos;ll review it and get back to you soon.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-sm">
      <div>
        <label htmlFor="orderId" className="block text-sm font-medium mb-1.5">
          Order
        </label>
        <select
          id="orderId"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          required
          className="w-full min-h-11 rounded-lg border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          {orders.map((order) => (
            <option key={order.id} value={order.id}>
              #{order.id.slice(0, 8)} — {formatPrice(order.total_amount)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="reason" className="block text-sm font-medium mb-1.5">
          Reason
        </label>
        <select
          id="reason"
          value={reason}
          onChange={(e) => setReason(e.target.value as typeof reason)}
          required
          className="w-full min-h-11 rounded-lg border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          {REASON_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium mb-1.5">
          Details <span className="text-muted-foreground font-normal">(optional)</span>
        </label>
        <textarea
          id="message"
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Add any details that will help us process your return faster."
          className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full min-h-11 rounded-full bg-primary text-primary-foreground px-6 py-3 text-sm font-medium hover:bg-primary-hover transition-colors disabled:opacity-50"
      >
        {isSubmitting ? "Submitting…" : "Submit Return Request"}
      </button>
    </form>
  )
}
