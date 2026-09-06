"use client"

import { useRef, useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createBanner, updateBanner, getBannerUploadUrl } from "@/app/(dashboard)/banners/actions"
import { getS3Url } from "@/lib/image"
import type { HeroBanner } from "@/lib/data/hero-banners"

export function BannerForm({
  banner,
  onSuccess,
  onCancel,
}: {
  banner?: HeroBanner
  onSuccess?: () => void
  onCancel?: () => void
}) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [title, setTitle] = useState(banner?.title ?? "")
  const [description, setDescription] = useState(banner?.description ?? "")
  const [ctaLabel, setCtaLabel] = useState(banner?.ctaLabel ?? "")
  const [linkUrl, setLinkUrl] = useState(banner?.linkUrl ?? "")
  const [altText, setAltText] = useState(banner?.altText ?? "")
  const [imagePath, setImagePath] = useState<string | null>(banner?.imagePath ?? null)
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(banner?.publicUrl ?? null)
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
      const urlResult = await getBannerUploadUrl(file.name, file.type)
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

    if (!imagePath) {
      setError("Upload a mockup image first.")
      return
    }

    setIsSubmitting(true)

    const input = { imagePath, title, description, ctaLabel, linkUrl, altText }

    const result = banner ? await updateBanner(banner.id, input) : await createBanner(input)

    if (!result.success) {
      setError(result.error)
      setIsSubmitting(false)
      return
    }

    setIsSubmitting(false)
    if (onSuccess) {
      onSuccess()
    } else {
      router.push("/banners")
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-xl">
      <div className="space-y-1.5">
        <Label>Mockup Image</Label>
        <p className="text-xs text-muted-foreground">
          The product mockup shown in the banner&apos;s second column. Recommended: a transparent or
          clean-background product shot, roughly square or portrait.
        </p>
        {imagePreviewUrl ? (
          <div className="relative w-full aspect-square max-w-50 rounded-md overflow-hidden bg-muted">
            <Image src={imagePreviewUrl} alt="" fill unoptimized className="object-contain" />
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

      <div className="space-y-1.5">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Ultra Sunscreen SPF 50"
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">
          Description <span className="text-muted-foreground font-normal">(optional)</span>
        </Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="ctaLabel">
            CTA Label <span className="text-muted-foreground font-normal">(optional)</span>
          </Label>
          <Input
            id="ctaLabel"
            value={ctaLabel}
            onChange={(e) => setCtaLabel(e.target.value)}
            placeholder="Shop Now"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="linkUrl">
            Link <span className="text-muted-foreground font-normal">(optional)</span>
          </Label>
          <Input
            id="linkUrl"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="/products/ultra-sunscreen"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="altText">Image Alt Text</Label>
        <Input
          id="altText"
          value={altText}
          onChange={(e) => setAltText(e.target.value)}
          placeholder="Describe the mockup image"
          required
        />
      </div>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting || isUploading}>
          {isSubmitting ? "Saving…" : banner ? "Save Changes" : "Create Banner"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel ?? (() => router.push("/banners"))}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
