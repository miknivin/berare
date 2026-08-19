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
import { createProduct, updateProduct } from "@/app/(dashboard)/products/actions"
import type { Category } from "@/lib/data/categories"
import type { ProductDetail } from "@/lib/data/products"

export function ProductForm({
  categories,
  product,
}: {
  categories: Category[]
  product?: ProductDetail
}) {
  const router = useRouter()
  const [name, setName] = useState(product?.name ?? "")
  const [description, setDescription] = useState(product?.description ?? "")
  const [price, setPrice] = useState(product ? String(product.price) : "")
  const [status, setStatus] = useState<"draft" | "active" | "disabled">(product?.status ?? "draft")
  const [categoryId, setCategoryId] = useState<string | null>(product?.category_id ?? null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    const input = {
      name,
      description: description || undefined,
      price: Number(price),
      status,
      categoryId,
    }

    const result = product
      ? await updateProduct(product.id, input)
      : await createProduct(input)

    if (!result.success) {
      setError(result.error)
      setIsSubmitting(false)
      return
    }

    // New products land back on their own edit page so images can be
    // added right away — product_images needs a real product_id to
    // attach to, so upload isn't possible until after this first save.
    router.push(product ? "/products" : `/products/${result.id}`)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-xl">
      <div className="space-y-1.5">
        <Label htmlFor="name">Name</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="price">Price (INR)</Label>
          <Input
            id="price"
            type="number"
            min="0"
            step="1"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label>Status</Label>
          <Select
            value={status}
            onValueChange={(v) => v && setStatus(v as typeof status)}
            items={[
              { value: "draft", label: "Draft" },
              { value: "active", label: "Active" },
              { value: "disabled", label: "Disabled" },
            ]}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="disabled">Disabled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Category</Label>
        <Select
          value={categoryId ?? "none"}
          onValueChange={(v) => setCategoryId(!v || v === "none" ? null : v)}
          items={[{ value: "none", label: "No category" }, ...categories.map((c) => ({ value: c.id, label: c.name }))]}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="No category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No category</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : product ? "Save Changes" : "Create Product"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/products")}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
