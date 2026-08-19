"use client"

import { useRef, useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  createCategory,
  updateCategory,
  getCategoryImageUploadUrl,
} from "@/app/(dashboard)/categories/actions"
import { getS3Url } from "@/lib/image"
import type { Category } from "@/lib/data/categories"

export function CategoryForm({
  categories,
  category,
  initialImageUrl,
  onSuccess,
  onCancel,
}: {
  categories: Category[]
  category?: Category
  /** Pre-resolved public URL for the category's existing image, if any. */
  initialImageUrl?: string | null
  /** When provided (e.g. rendered inside a modal), called instead of navigating back to /categories. */
  onSuccess?: () => void
  onCancel?: () => void
}) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [name, setName] = useState(category?.name ?? "")
  const [parentId, setParentId] = useState<string | null>(category?.parent_id ?? null)
  const [imagePath, setImagePath] = useState<string | null>(category?.image_path ?? null)
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(initialImageUrl ?? null)
  const [isUploading, setIsUploading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return

    setError(null)
    setIsUploading(true)

    try {
      const urlResult = await getCategoryImageUploadUrl(file.name, file.type)
      if (!urlResult.success) {
        setError(urlResult.error)
        return
      }

      const uploadResponse = await fetch(urlResult.uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      })
      if (!uploadResponse.ok) {
        setError("Upload to storage failed. Please try again.")
        return
      }

      setImagePath(urlResult.key)
      setImagePreviewUrl(getS3Url(urlResult.key))
    } catch {
      setError("Something went wrong uploading the image.")
    } finally {
      setIsUploading(false)
    }
  }

  function handleRemoveImage() {
    setImagePath(null)
    setImagePreviewUrl(null)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    const input = { name, parentId, imagePath }

    const result = category
      ? await updateCategory(category.id, input)
      : await createCategory(input)

    if (!result.success) {
      setError(result.error)
      setIsSubmitting(false)
      return
    }

    setIsSubmitting(false)
    if (onSuccess) {
      onSuccess()
    } else {
      router.push("/categories")
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-xl">
      <div className="space-y-1.5">
        <Label htmlFor="name">Name</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>

      <div className="space-y-1.5">
        <Label>Parent Category</Label>
        <Select
          value={parentId ?? "none"}
          onValueChange={(v) => setParentId(!v || v === "none" ? null : v)}
          items={[{ value: "none", label: "No parent" }, ...categories.map((c) => ({ value: c.id, label: c.name }))]}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="No parent" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No parent</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label>Card Image</Label>
        <p className="text-xs text-muted-foreground">
          Shown behind the category name on the storefront&apos;s &quot;Shop by Category&quot; cards.
        </p>
        {imagePreviewUrl ? (
          <div className="relative w-full aspect-4/3 max-w-50 rounded-md overflow-hidden bg-muted">
            <Image src={imagePreviewUrl} alt="" fill unoptimized className="object-cover" />
            <button
              type="button"
              onClick={handleRemoveImage}
              aria-label="Remove image"
              className="absolute top-1.5 right-1.5 flex items-center justify-center w-6 h-6 rounded-full bg-background/90 hover:bg-background"
            >
              <X className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        ) : (
          <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
            <Upload className="w-4 h-4" aria-hidden="true" />
            {isUploading ? "Uploading…" : "Upload Image"}
          </Button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting || isUploading}>
          {isSubmitting ? "Saving…" : category ? "Save Changes" : "Create Category"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel ?? (() => router.push("/categories"))}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
