"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updatePayoutDetails } from "@/app/(dashboard)/settings/actions"
import type { PayoutDetails } from "@/lib/auth"

export function BankDetailsForm({ payoutDetails }: { payoutDetails: PayoutDetails | null }) {
  const router = useRouter()
  const [accountHolderName, setAccountHolderName] = useState(payoutDetails?.accountHolderName ?? "")
  const [accountNumber, setAccountNumber] = useState(payoutDetails?.accountNumber ?? "")
  const [ifscCode, setIfscCode] = useState(payoutDetails?.ifscCode ?? "")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setSaved(false)
    setIsSubmitting(true)
    const result = await updatePayoutDetails({ accountHolderName, accountNumber, ifscCode })
    setIsSubmitting(false)
    if (!result.success) {
      setError(result.error)
      return
    }
    setSaved(true)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-sm">
      <div className="space-y-1.5">
        <Label htmlFor="accountHolderName">Account holder name</Label>
        <Input
          id="accountHolderName"
          required
          value={accountHolderName}
          onChange={(e) => setAccountHolderName(e.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="accountNumber">Account number</Label>
        <Input
          id="accountNumber"
          required
          inputMode="numeric"
          value={accountNumber}
          onChange={(e) => setAccountNumber(e.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="ifscCode">IFSC code</Label>
        <Input
          id="ifscCode"
          required
          placeholder="HDFC0001234"
          value={ifscCode}
          onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
          className="uppercase"
        />
      </div>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      {saved && !error && <p className="text-sm text-muted-foreground">Bank details saved.</p>}

      <Button type="submit" className="h-9" disabled={isSubmitting}>
        {isSubmitting ? "Saving…" : "Save Bank Details"}
      </Button>
    </form>
  )
}
