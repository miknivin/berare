"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { Ban, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { IconTooltipButton } from "@/components/shared/icon-tooltip-button"
import { toast } from "@/components/ui/toast"
import { toggleProductStatus } from "@/app/(dashboard)/products/actions"
import type { ProductStatus } from "@/lib/data/products"

export function ProductStatusToggle({ id, status }: { id: string; status: ProductStatus }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  if (status === "draft") return null // toggle only makes sense for active/disabled

  const nextStatus: "active" | "disabled" = status === "active" ? "disabled" : "active"

  function handleClick() {
    startTransition(async () => {
      const result = await toggleProductStatus(id, nextStatus)
      if (!result.success) {
        toast.error("Could not update product status", result.error)
        return
      }
      router.refresh()
    })
  }

  return (
    <IconTooltipButton
      label={status === "active" ? "Disable" : "Enable"}
      render={
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={handleClick}
          disabled={isPending}
          aria-label={status === "active" ? "Disable" : "Enable"}
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
