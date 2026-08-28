"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { generateLink } from "@/app/(dashboard)/links/actions"
import type { SelectableProduct } from "@/lib/data/affiliate"

export function GenerateLinkForm({ products }: { products: SelectableProduct[] }) {
  const router = useRouter()
  const [productId, setProductId] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)
    const result = await generateLink({ productId: productId || null })
    setIsSubmitting(false)
    if (!result.success) {
      setError(result.error)
      return
    }
    setProductId("")
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-3 flex-wrap">
      <div className="space-y-1.5">
        <label htmlFor="product" className="block text-sm font-medium">
          Product (optional)
        </label>
        <select
          id="product"
          value={productId}
          onChange={(event) => setProductId(event.target.value)}
          className="h-9 min-w-48 rounded-lg border border-input bg-transparent px-2.5 text-sm"
        >
          <option value="">General link (homepage)</option>
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name}
            </option>
          ))}
        </select>
      </div>
      <Button type="submit" className="h-9" disabled={isSubmitting}>
        {isSubmitting ? "Generating…" : "Generate Link"}
      </Button>
      {error && <p className="text-sm text-destructive w-full">{error}</p>}
    </form>
  )
}
