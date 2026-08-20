"use client"

import { useState } from "react"
import Image from "next/image"
import Lightbox from "yet-another-react-lightbox"
import Zoom from "yet-another-react-lightbox/plugins/zoom"
import "yet-another-react-lightbox/styles.css"
import { ZoomIn, Sparkles } from "lucide-react"
import { getProductImageUrl } from "@/lib/image"
import type { ProductImage as ProductImageType } from "@/lib/data/products"
import { cn } from "@/lib/utils"

export function ProductGallery({
  images,
  alt,
  className,
}: {
  images: ProductImageType[]
  alt: string
  className?: string
}) {
  const sorted = [...images].sort((a, b) => a.position - b.position)
  const [activeIndex, setActiveIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  if (sorted.length === 0) {
    return (
      <div className={cn("flex items-center justify-center bg-muted text-muted-foreground rounded-2xl", className)}>
        <Sparkles className="w-8 h-8 opacity-40" aria-hidden="true" />
      </div>
    )
  }

  const active = sorted[activeIndex]
  const slides = sorted.map((img) => ({ src: getProductImageUrl(img.storage_path) }))

  return (
    <div>
      <button
        type="button"
        onClick={() => setLightboxOpen(true)}
        className={cn(
          "group relative overflow-hidden bg-muted w-full block rounded-2xl cursor-zoom-in",
          className
        )}
        aria-label="View full-size image"
      >
        <Image
          src={getProductImageUrl(active.storage_path)}
          alt={alt}
          fill
          priority
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        <span className="absolute bottom-3 right-3 flex items-center justify-center w-9 h-9 rounded-full bg-background/90 text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
          <ZoomIn className="w-4 h-4" aria-hidden="true" />
        </span>
      </button>

      {sorted.length > 1 && (
        <div className="flex gap-3 mt-4 overflow-x-auto pb-1">
          {sorted.map((img, index) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`View image ${index + 1}`}
              aria-current={index === activeIndex}
              className={cn(
                "relative shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-muted border-2 transition-colors",
                index === activeIndex ? "border-primary" : "border-transparent hover:border-border"
              )}
            >
              <Image src={getProductImageUrl(img.storage_path)} alt="" fill className="object-cover" sizes="64px" />
            </button>
          ))}
        </div>
      )}

      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        index={activeIndex}
        slides={slides}
        plugins={[Zoom]}
        on={{ view: ({ index }) => setActiveIndex(index) }}
        zoom={{ maxZoomPixelRatio: 3 }}
      />
    </div>
  )
}
