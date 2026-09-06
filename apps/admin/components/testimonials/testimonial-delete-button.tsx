"use client"

import { useRouter } from "next/navigation"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { deleteTestimonial } from "@/app/(dashboard)/testimonials/actions"

export function TestimonialDeleteButton({ id, customerName }: { id: string; customerName: string }) {
  const router = useRouter()

  async function handleDelete() {
    const result = await deleteTestimonial(id)
    if (!result.success) {
      toast.error("Could not delete testimonial", result.error)
      return
    }
    toast.success("Testimonial deleted")
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
      title="Delete testimonial?"
      description={`The testimonial from "${customerName}" will be permanently deleted.`}
      confirmLabel="Delete"
      onConfirm={handleDelete}
    />
  )
}
