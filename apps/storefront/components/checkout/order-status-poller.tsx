"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

// Payment confirmation happens asynchronously via the Razorpay webhook,
// which can land a second or two after the redirect here. Poll for the
// status to flip rather than leaving the customer on a stale "pending"
// screen with no feedback.
export function OrderStatusPoller({ status }: { status: string }) {
  const router = useRouter()

  useEffect(() => {
    if (status !== "pending") return
    const interval = setInterval(() => router.refresh(), 3000)
    return () => clearInterval(interval)
  }, [status, router])

  return null
}
