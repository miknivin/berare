"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/toast"
import { updatePaymentSettings } from "@/app/(dashboard)/settings/actions"
import type { PaymentSettings } from "@/lib/data/settings"

export function PaymentSettingsForm({ settings }: { settings: PaymentSettings }) {
  const router = useRouter()
  const [prepaidDiscountPercent, setPrepaidDiscountPercent] = useState(String(settings.prepaidDiscountPercent))
  const [codFreeShippingThreshold, setCodFreeShippingThreshold] = useState(
    String(settings.codFreeShippingThreshold)
  )
  const [codAdditionalCharge, setCodAdditionalCharge] = useState(String(settings.codAdditionalCharge))
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    const result = await updatePaymentSettings({
      prepaidDiscountPercent: Number(prepaidDiscountPercent),
      codFreeShippingThreshold: Number(codFreeShippingThreshold),
      codAdditionalCharge: Number(codAdditionalCharge),
    })
    setIsSubmitting(false)
    if (!result.success) {
      toast.error("Could not save payment settings", result.error)
      return
    }
    toast.success("Payment settings saved")
    router.refresh()
  }

  const thresholdIsZero = Number(codFreeShippingThreshold) === 0

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="prepaidDiscountPercent">Prepaid discount (%)</Label>
        <Input
          id="prepaidDiscountPercent"
          type="number"
          min={0}
          max={100}
          step="0.01"
          required
          value={prepaidDiscountPercent}
          onChange={(e) => setPrepaidDiscountPercent(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          Applied to the order subtotal when paying online (Razorpay).
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="codFreeShippingThreshold">COD free-shipping benchmark (₹)</Label>
        <Input
          id="codFreeShippingThreshold"
          type="number"
          min={0}
          step="1"
          required
          value={codFreeShippingThreshold}
          onChange={(e) => setCodFreeShippingThreshold(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          COD orders at or above this subtotal skip the additional charge below. Set to 0 to always charge it,
          regardless of order total.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="codAdditionalCharge">COD additional charge (₹)</Label>
        <Input
          id="codAdditionalCharge"
          type="number"
          min={0}
          step="1"
          required
          value={codAdditionalCharge}
          onChange={(e) => setCodAdditionalCharge(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          {thresholdIsZero
            ? "Benchmark is 0 — this charge applies to every COD order."
            : "Added to a COD order only when its subtotal is below the benchmark above."}
        </p>
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving…" : "Save Payment Settings"}
      </Button>
    </form>
  )
}
