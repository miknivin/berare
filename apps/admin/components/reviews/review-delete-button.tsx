"use client"

import { useRouter } from "next/navigation"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { deleteReview } from "@/app/(dashboard)/reviews/actions"

export function ReviewDeleteButton({ id, reviewerName }: { id: string; reviewerName: string }) {
  const router = useRouter()

  async function handleDelete() {
    const result = await deleteReview(id)
    if (!result.success) {
      toast.error("Could not delete review", result.error)
      return
    }
    toast.success("Review deleted")
    router.refresh()
  }

  return (
    <ConfirmDialog
      trigger={
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Delete"
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="w-4 h-4" aria-hidden="true" />
        </Button>
      }
      tooltipLabel="Delete"
      title="Delete review?"
      description={`The review from "${reviewerName}" will be permanently deleted.`}
      confirmLabel="Delete"
      onConfirm={handleDelete}
    />
  )
}
