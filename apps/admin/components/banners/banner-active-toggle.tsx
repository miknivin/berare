"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { Ban, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { IconTooltipButton } from "@/components/shared/icon-tooltip-button"
import { toast } from "@/components/ui/toast"
import { toggleBannerActive } from "@/app/(dashboard)/banners/actions"

export function BannerActiveToggle({ id, isActive }: { id: string; isActive: boolean }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    startTransition(async () => {
      const result = await toggleBannerActive(id, !isActive)
      if (!result.success) {
        toast.error("Could not update banner", result.error)
        return
      }
      router.refresh()
    })
  }

  return (
    <IconTooltipButton
      label={isActive ? "Hide" : "Show"}
      render={
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={handleClick}
          disabled={isPending}
          aria-label={isActive ? "Hide" : "Show"}
        />
      }
    >
      {isActive ? (
        <Ban className="w-4 h-4" aria-hidden="true" />
      ) : (
        <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
      )}
    </IconTooltipButton>
  )
}
