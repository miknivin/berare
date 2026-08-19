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
import { CategoryForm } from "./category-form"
import type { Category } from "@/lib/data/categories"

export function CategoryDialog({
  categories,
  category,
  initialImageUrl,
  trigger,
  tooltipLabel,
}: {
  categories: Category[]
  category?: Category
  initialImageUrl?: string | null
  trigger: React.ReactElement
  /** When provided, wraps the trigger with a hover/focus tooltip. */
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
          <DialogTitle>{category ? "Edit Category" : "New Category"}</DialogTitle>
        </DialogHeader>
        <CategoryForm
          categories={categories}
          category={category}
          initialImageUrl={initialImageUrl}
          onSuccess={handleSuccess}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
