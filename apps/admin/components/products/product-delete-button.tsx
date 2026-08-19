"use client"

import { useRouter } from "next/navigation"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { deleteProduct } from "@/app/(dashboard)/products/actions"

export function ProductDeleteButton({ id, name }: { id: string; name: string }) {
  const router = useRouter()

  async function handleDelete() {
    const result = await deleteProduct(id)
    if (!result.success) {
      toast.error("Could not delete product", result.error)
      return
    }
    toast.success(`"${name}" deleted`)
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
      title="Delete product?"
      description={`"${name}" will be permanently deleted. This cannot be undone.`}
      confirmLabel="Delete"
      onConfirm={handleDelete}
    />
  )
}
