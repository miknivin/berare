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
import { TestimonialForm } from "./testimonial-form"
import type { Testimonial } from "@/lib/data/testimonials"

export function TestimonialDialog({
  testimonial,
  trigger,
  tooltipLabel,
}: {
  testimonial?: Testimonial
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
          <DialogTitle>{testimonial ? "Edit Testimonial" : "New Testimonial"}</DialogTitle>
        </DialogHeader>
        <TestimonialForm
          testimonial={testimonial}
          onSuccess={handleSuccess}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
