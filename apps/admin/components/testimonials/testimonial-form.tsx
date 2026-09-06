"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createTestimonial, updateTestimonial } from "@/app/(dashboard)/testimonials/actions"
import type { Testimonial } from "@/lib/data/testimonials"

const RATING_ITEMS = [1, 2, 3, 4, 5].map((n) => ({ value: String(n), label: `${n} star${n > 1 ? "s" : ""}` }))

export function TestimonialForm({
  testimonial,
  onSuccess,
  onCancel,
}: {
  testimonial?: Testimonial
  onSuccess?: () => void
  onCancel?: () => void
}) {
  const router = useRouter()
  const [customerName, setCustomerName] = useState(testimonial?.customer_name ?? "")
  const [rating, setRating] = useState(String(testimonial?.rating ?? 5))
  const [body, setBody] = useState(testimonial?.body ?? "")
  const [displayOrder, setDisplayOrder] = useState(String(testimonial?.display_order ?? 0))
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    const input = {
      customerName,
      rating: Number(rating),
      body,
      displayOrder: Number(displayOrder) || 0,
    }

    const result = testimonial
      ? await updateTestimonial(testimonial.id, input)
      : await createTestimonial(input)

    if (!result.success) {
      setError(result.error)
      setIsSubmitting(false)
      return
    }

    setIsSubmitting(false)
    if (onSuccess) {
      onSuccess()
    } else {
      router.push("/testimonials")
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-xl">
      <div className="space-y-1.5">
        <Label htmlFor="customerName">Customer Name</Label>
        <Input
          id="customerName"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          placeholder="e.g. Priya S."
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Rating</Label>
          <Select value={rating} onValueChange={(v) => v && setRating(v)} items={RATING_ITEMS}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {RATING_ITEMS.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="displayOrder">Display Order</Label>
          <Input
            id="displayOrder"
            type="number"
            step="1"
            value={displayOrder}
            onChange={(e) => setDisplayOrder(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="body">Testimonial</Label>
        <Textarea id="body" value={body} onChange={(e) => setBody(e.target.value)} rows={4} required />
      </div>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : testimonial ? "Save Changes" : "Create Testimonial"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel ?? (() => router.push("/testimonials"))}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
