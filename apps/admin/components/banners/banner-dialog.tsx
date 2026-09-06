"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { BannerForm } from "./banner-form"
import type { HeroBanner } from "@/lib/data/hero-banners"

export function BannerDialog({
  banner,
  trigger,
  tooltipLabel,
}: {
  banner?: HeroBanner
  trigger: React.ReactElement
  tooltipLabel?: string
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  function handleSuccess() {
    setOpen(false)
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {tooltipLabel ? (
        <Tooltip>
          <TooltipTrigger render={<DialogTrigger render={trigger} />} />
          <TooltipContent>{tooltipLabel}</TooltipContent>
        </Tooltip>
      ) : (
        <DialogTrigger render={trigger} />
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{banner ? "Edit Banner" : "New Banner"}</DialogTitle>
        </DialogHeader>
        <BannerForm banner={banner} onSuccess={handleSuccess} onCancel={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}
