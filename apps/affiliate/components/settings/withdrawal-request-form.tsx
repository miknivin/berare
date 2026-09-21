"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { requestWithdrawal } from "@/app/(dashboard)/settings/actions"

export function WithdrawalRequestForm({ availablePoints }: { availablePoints: number }) {
  const router = useRouter()
  const [points, setPoints] = useState(String(availablePoints))
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)
    const result = await requestWithdrawal({ points: Number(points) })
    setIsSubmitting(false)
    if (!result.success) {
      setError(result.error)
      return
    }
    setSubmitted(true)
    router.refresh()
  }

  if (submitted) {
    return <p className="text-sm text-muted-foreground">Withdrawal request submitted — we&apos;ll review it soon.</p>
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-3 flex-wrap max-w-sm">
      <div className="space-y-1.5 flex-1 min-w-32">
        <Label htmlFor="points">Points to withdraw</Label>
        <Input
          id="points"
          type="number"
          required
          min={1}
          max={availablePoints}
          value={points}
          onChange={(e) => setPoints(e.target.value)}
        />
      </div>
      <Button type="submit" className="h-9" disabled={isSubmitting}>
        {isSubmitting ? "Submitting…" : "Request Withdrawal"}
      </Button>
      {error && <p className="text-sm text-destructive w-full">{error}</p>}
    </form>
  )
}
