"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Check, X, PackageCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/toast"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
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
import { acceptReturnRequest, rejectReturnRequest, completeReturnRequest } from "@/app/(dashboard)/returns/actions"
import type { ReturnStatus } from "@/lib/data/returns"

export function ReturnRequestActions({ id, status }: { id: string; status: ReturnStatus }) {
  const router = useRouter()

  async function handleAccept() {
    const result = await acceptReturnRequest(id)
    if (!result.success) {
      toast.error("Could not accept return", result.error)
      return
    }
    toast.success("Return accepted")
    router.refresh()
  }

  async function handleComplete() {
    const result = await completeReturnRequest(id)
    if (!result.success) {
      toast.error("Could not complete return", result.error)
      return
    }
    toast.success("Return marked as completed")
    router.refresh()
  }

  if (status === "rejected" || status === "completed") {
    return null
  }

  return (
    <div className="inline-flex items-center gap-2">
      {status === "requested" && (
        <ConfirmDialog
          trigger={
            <Button type="button" variant="ghost" size="sm">
              <Check className="w-4 h-4" aria-hidden="true" />
              Accept
            </Button>
          }
          title="Accept this return request?"
          description="The order will be marked as return-accepted. Reject it instead if this isn't a valid return."
          confirmLabel="Accept"
          destructive={false}
          onConfirm={handleAccept}
        />
      )}
      {status === "accepted" && (
        <ConfirmDialog
          trigger={
            <Button type="button" variant="ghost" size="sm">
              <PackageCheck className="w-4 h-4" aria-hidden="true" />
              Mark Completed
            </Button>
          }
          title="Mark this return as completed?"
          description="Use this once the item has been received back and any refund has been issued."
          confirmLabel="Mark Completed"
          destructive={false}
          onConfirm={handleComplete}
        />
      )}
      <RejectReturnDialog id={id} onDone={() => router.refresh()} />
    </div>
  )
}

function RejectReturnDialog({ id, onDone }: { id: string; onDone: () => void }) {
  const [open, setOpen] = useState(false)
  const [note, setNote] = useState("")
  const [isPending, setIsPending] = useState(false)

  async function handleReject() {
    setIsPending(true)
    const result = await rejectReturnRequest(id, { adminNote: note })
    setIsPending(false)
    if (!result.success) {
      toast.error("Could not reject return", result.error)
      return
    }
    toast.success("Return request rejected")
    setOpen(false)
    onDone()
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <X className="w-4 h-4" aria-hidden="true" />
            Reject
          </Button>
        }
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Reject this return request?</AlertDialogTitle>
          <AlertDialogDescription>
            The order reverts to &quot;Delivered&quot; — the customer keeps the item and no refund is issued.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-1.5">
          <Label htmlFor={`note-${id}`}>Note (visible to the customer)</Label>
          <Textarea
            id={`note-${id}`}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="Reason for rejection…"
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogClose render={<Button type="button" variant="outline" disabled={isPending} />}>
            Cancel
          </AlertDialogClose>
          <Button type="button" variant="destructive" onClick={handleReject} disabled={isPending}>
            {isPending ? "Please wait…" : "Reject"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
