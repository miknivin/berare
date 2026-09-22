"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/toast"
import { updateAffiliateSettings } from "@/app/(dashboard)/settings/actions"
import type { AffiliateSettings } from "@/lib/data/settings"

export function AffiliateSettingsForm({ settings }: { settings: AffiliateSettings }) {
  const router = useRouter()
  const [pointsPerClick, setPointsPerClick] = useState(String(settings.pointsPerClick))
  const [commissionRatePercent, setCommissionRatePercent] = useState(String(settings.commissionRatePercent))
  const [pointsToInrRate, setPointsToInrRate] = useState(String(settings.pointsToInrRate))
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    const result = await updateAffiliateSettings({
      pointsPerClick: Number(pointsPerClick),
      commissionRatePercent: Number(commissionRatePercent),
      pointsToInrRate: Number(pointsToInrRate),
    })
    setIsSubmitting(false)
    if (!result.success) {
      toast.error("Could not save affiliate settings", result.error)
      return
    }
    toast.success("Affiliate settings saved")
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="pointsPerClick">Points per click</Label>
        <Input
          id="pointsPerClick"
          type="number"
          min={0}
          step="0.01"
          required
          value={pointsPerClick}
          onChange={(e) => setPointsPerClick(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          Awarded the moment someone clicks an affiliate&apos;s link. Set to 0 to disable.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="commissionRatePercent">Commission per order (%)</Label>
        <Input
          id="commissionRatePercent"
          type="number"
          min={0}
          max={100}
          step="0.01"
          required
          value={commissionRatePercent}
          onChange={(e) => setCommissionRatePercent(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          Points earned per order = this % of the order total.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="pointsToInrRate">Value of 1 point (₹)</Label>
        <Input
          id="pointsToInrRate"
          type="number"
          min={0.01}
          step="0.01"
          required
          value={pointsToInrRate}
          onChange={(e) => setPointsToInrRate(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">Used to convert an affiliate&apos;s points into a payout amount.</p>
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving…" : "Save Affiliate Settings"}
      </Button>
    </form>
  )
}
