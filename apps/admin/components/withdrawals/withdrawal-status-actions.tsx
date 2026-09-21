"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Check, X, Banknote } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { approveWithdrawal, rejectWithdrawal, markWithdrawalPaid } from "@/app/(dashboard)/withdrawals/actions"
import type { WithdrawalStatus } from "@/lib/data/withdrawals"

export function WithdrawalStatusActions({ id, status }: { id: string; status: WithdrawalStatus }) {
  const router = useRouter()

  async function handleApprove() {
    const result = await approveWithdrawal(id)
    if (!result.success) {
      toast.error("Could not approve withdrawal", result.error)
      return
    }
    toast.success("Withdrawal approved")
    router.refresh()
  }

  if (status === "paid" || status === "rejected") {
    return null
  }

  return (
    <div className="inline-flex items-center gap-2">
      {status === "requested" && (
        <ConfirmDialog
          trigger={
            <Button type="button" variant="ghost" size="sm">
              <Check className="w-4 h-4" aria-hidden="true" />
              Approve
            </Button>
          }
          title="Approve this withdrawal?"
          description="The affiliate will be notified their request is being processed for payout."
          confirmLabel="Approve"
          destructive={false}
          onConfirm={handleApprove}
        />
      )}
      {status === "approved" && <MarkPaidDialog id={id} onDone={() => router.refresh()} />}
      <RejectWithdrawalDialog id={id} onDone={() => router.refresh()} />
    </div>
  )
}

function RejectWithdrawalDialog({ id, onDone }: { id: string; onDone: () => void }) {
  const [open, setOpen] = useState(false)
  const [note, setNote] = useState("")
  const [isPending, setIsPending] = useState(false)

  async function handleReject() {
    setIsPending(true)
    const result = await rejectWithdrawal(id, { adminNote: note })
    setIsPending(false)
    if (!result.success) {
      toast.error("Could not reject withdrawal", result.error)
      return
    }
    toast.success("Withdrawal rejected — points returned to the affiliate's balance")
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
          <AlertDialogTitle>Reject this withdrawal?</AlertDialogTitle>
          <AlertDialogDescription>
            The requested points will be returned to the affiliate&apos;s available balance.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-1.5">
          <Label htmlFor={`note-${id}`}>Note (optional)</Label>
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

function MarkPaidDialog({ id, onDone }: { id: string; onDone: () => void }) {
  const [open, setOpen] = useState(false)
  const [payoutReference, setPayoutReference] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  async function handleMarkPaid() {
    setError(null)
    setIsPending(true)
    const result = await markWithdrawalPaid(id, { payoutReference })
    setIsPending(false)
    if (!result.success) {
      setError(result.error)
      return
    }
    toast.success("Withdrawal marked as paid")
    setOpen(false)
    onDone()
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        render={
          <Button type="button" variant="ghost" size="sm">
            <Banknote className="w-4 h-4" aria-hidden="true" />
            Mark Paid
          </Button>
        }
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Mark this withdrawal as paid?</AlertDialogTitle>
          <AlertDialogDescription>
            Record the NEFT/netbanking reference (UTR) for the transfer you made outside the app.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-1.5">
          <Label htmlFor={`ref-${id}`}>Payout reference (UTR)</Label>
          <Input
            id={`ref-${id}`}
            value={payoutReference}
            onChange={(e) => setPayoutReference(e.target.value)}
            placeholder="e.g. UTR1234567890"
          />
          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
        </div>
        <AlertDialogFooter>
          <AlertDialogClose render={<Button type="button" variant="outline" disabled={isPending} />}>
            Cancel
          </AlertDialogClose>
          <Button type="button" onClick={handleMarkPaid} disabled={isPending}>
            {isPending ? "Please wait…" : "Mark Paid"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
