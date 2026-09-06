"use client"

import { useRouter } from "next/navigation"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { deleteBanner } from "@/app/(dashboard)/banners/actions"

export function BannerDeleteButton({ id, title }: { id: string; title: string }) {
  const router = useRouter()

  async function handleDelete() {
    const result = await deleteBanner(id)
    if (!result.success) {
      toast.error("Could not delete banner", result.error)
      return
    }
    toast.success("Banner deleted")
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
      title="Delete banner?"
      description={`"${title}" will be permanently removed from the storefront.`}
      confirmLabel="Delete"
      onConfirm={handleDelete}
    />
  )
}
