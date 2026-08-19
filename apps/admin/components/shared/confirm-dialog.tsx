"use client"

import { useState, type ReactElement, type ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogClose,
} from "@/components/ui/alert-dialog"

/**
 * A styled confirm-before-destructive-action dialog — replaces
 * window.confirm() everywhere it's needed. `onConfirm` is awaited and the
 * dialog stays open (with the confirm button disabled) until it resolves.
 */
export function ConfirmDialog({
  trigger,
  tooltipLabel,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = true,
  onConfirm,
}: {
  trigger: ReactElement
  /** When provided, wraps the trigger with a hover/focus tooltip. */
  tooltipLabel?: string
  title: string
  description: ReactNode
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
  onConfirm: () => void | Promise<void>
}) {
  const [open, setOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)

  async function handleConfirm() {
    setIsPending(true)
    try {
      await onConfirm()
      setOpen(false)
    } finally {
      setIsPending(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      {tooltipLabel ? (
        <Tooltip>
          <TooltipTrigger render={<AlertDialogTrigger render={trigger} />} />
          <TooltipContent>{tooltipLabel}</TooltipContent>
        </Tooltip>
      ) : (
        <AlertDialogTrigger render={trigger} />
      )}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogClose render={<Button type="button" variant="outline" disabled={isPending} />}>
            {cancelLabel}
          </AlertDialogClose>
          <Button
            type="button"
            variant={destructive ? "destructive" : "default"}
            onClick={handleConfirm}
            disabled={isPending}
          >
            {isPending ? "Please wait…" : confirmLabel}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
