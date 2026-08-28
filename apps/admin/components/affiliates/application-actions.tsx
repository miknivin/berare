"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Check, X } from "lucide-react"
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
import { approveApplication, rejectApplication } from "@/app/(dashboard)/affiliates/actions"

export function ApplicationActions({ id, fullName }: { id: string; fullName: string }) {
  const router = useRouter()

  async function handleApprove() {
    const result = await approveApplication(id)
    if (!result.success) {
      toast.error("Could not approve application", result.error)
      return
    }
    toast.success(`${fullName} approved as an affiliate`)
    router.refresh()
  }

  return (
    <div className="inline-flex items-center gap-2">
      <ConfirmDialog
        trigger={
          <Button type="button" variant="ghost" size="sm">
            <Check className="w-4 h-4" aria-hidden="true" />
            Approve
          </Button>
        }
        title="Approve this application?"
        description={`${fullName} will become an active affiliate with a generated referral code.`}
        confirmLabel="Approve"
        destructive={false}
        onConfirm={handleApprove}
      />
      <RejectApplicationDialog id={id} fullName={fullName} onRejected={() => router.refresh()} />
    </div>
  )
}

function RejectApplicationDialog({
  id,
  fullName,
  onRejected,
}: {
  id: string
  fullName: string
  onRejected: () => void
}) {
  const [open, setOpen] = useState(false)
  const [note, setNote] = useState("")
  const [isPending, setIsPending] = useState(false)

  async function handleReject() {
    setIsPending(true)
    const result = await rejectApplication(id, { adminNote: note })
    setIsPending(false)
    if (!result.success) {
      toast.error("Could not reject application", result.error)
      return
    }
    toast.success(`${fullName}'s application rejected`)
    setOpen(false)
    onRejected()
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
          <AlertDialogTitle>Reject this application?</AlertDialogTitle>
          <AlertDialogDescription>
            {fullName}&apos;s application will be marked rejected. They can reapply later.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-1.5">
          <Label htmlFor={`note-${id}`}>Note (optional, visible to applicant)</Label>
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
