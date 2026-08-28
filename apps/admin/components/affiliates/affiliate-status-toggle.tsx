"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { Ban, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { IconTooltipButton } from "@/components/shared/icon-tooltip-button"
import { toast } from "@/components/ui/toast"
import { toggleAffiliateStatus } from "@/app/(dashboard)/affiliates/actions"
import type { AffiliateStatus } from "@/lib/data/affiliates"

export function AffiliateStatusToggle({ id, status }: { id: string; status: AffiliateStatus }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  if (status === "deactivated") return null

  const nextStatus: "active" | "suspended" = status === "active" ? "suspended" : "active"

  function handleClick() {
    startTransition(async () => {
      const result = await toggleAffiliateStatus(id, nextStatus)
      if (!result.success) {
        toast.error("Could not update affiliate status", result.error)
        return
      }
      toast.success(status === "active" ? "Affiliate suspended" : "Affiliate reactivated")
      router.refresh()
    })
  }

  return (
    <IconTooltipButton
      label={status === "active" ? "Suspend" : "Reactivate"}
      render={
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={handleClick}
          disabled={isPending}
          aria-label={status === "active" ? "Suspend" : "Reactivate"}
        />
      }
    >
      {status === "active" ? (
        <Ban className="w-4 h-4" aria-hidden="true" />
      ) : (
        <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
      )}
    </IconTooltipButton>
  )
}
