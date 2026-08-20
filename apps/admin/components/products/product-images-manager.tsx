"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Lightbox from "yet-another-react-lightbox"
import Zoom from "yet-another-react-lightbox/plugins/zoom"
import "yet-another-react-lightbox/styles.css"
import { X, Upload } from "lucide-react"
import { toast } from "@/components/ui/toast"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import {
  getProductImageUploadUrl,
  addProductImage,
  deleteProductImage,
} from "@/app/(dashboard)/products/actions"
import type { ProductImage } from "@/lib/data/products"

export function ProductImagesManager({
  productId,
  images,
}: {
  productId: string
  images: ProductImage[]
}) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = "" // allow re-selecting the same file later
    if (!file) return

    setIsUploading(true)

    try {
      const urlResult = await getProductImageUploadUrl(productId, file.name, file.type)
      if (!urlResult.success) {
        toast.error("Could not upload image", urlResult.error)
        return
      }

      const uploadResponse = await fetch(urlResult.uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      })
      if (!uploadResponse.ok) {
        toast.error("Upload to storage failed", "Please try again.")
        return
      }

      const saveResult = await addProductImage(productId, urlResult.key)
      if (!saveResult.success) {
        toast.error("Could not save image", saveResult.error)
        return
      }

      router.refresh()
    } catch {
      toast.error("Something went wrong uploading the image.")
    } finally {
      setIsUploading(false)
    }
  }

  async function handleDelete(imageId: string) {
    const result = await deleteProductImage(imageId, productId)
    if (!result.success) {
      toast.error("Could not delete image", result.error)
      return
    }
    toast.success("Image deleted")
    router.refresh()
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {images.map((image, index) => (
          <div key={image.id} className="relative aspect-square rounded-lg overflow-hidden bg-muted group">
            <button
              type="button"
              onClick={() => setLightboxIndex(index)}
              aria-label="View full-size image"
              className="absolute inset-0 z-0 cursor-zoom-in"
            >
              <Image src={image.publicUrl} alt="" fill className="object-cover" sizes="150px" />
            </button>
            <ConfirmDialog
              trigger={
                <button
                  type="button"
                  aria-label="Delete image"
                  className="absolute top-1 right-1 z-10 w-6 h-6 flex items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
                >
                  <X className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              }
              title="Delete image?"
              description="This image will be permanently removed."
              confirmLabel="Delete"
              onConfirm={() => handleDelete(image.id)}
            />
          </div>
        ))}

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="aspect-square rounded-lg border border-dashed border-border flex flex-col items-center justify-center gap-1 text-muted-foreground hover:bg-muted transition-colors disabled:opacity-50"
        >
          <Upload className="w-5 h-5" aria-hidden="true" />
          <span className="text-xs">{isUploading ? "Uploading…" : "Add image"}</span>
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

      <Lightbox
        open={lightboxIndex !== null}
        close={() => setLightboxIndex(null)}
        index={lightboxIndex ?? 0}
        slides={images.map((img) => ({ src: img.publicUrl }))}
        plugins={[Zoom]}
        on={{ view: ({ index }) => setLightboxIndex(index) }}
        zoom={{ maxZoomPixelRatio: 3 }}
      />
    </div>
  )
}
