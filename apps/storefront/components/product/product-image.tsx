import Image from "next/image"
import { Sparkles } from "lucide-react"
import { getProductImageUrl } from "@/lib/image"
import type { ProductImage as ProductImageType } from "@/lib/data/products"
import { cn } from "@/lib/utils"

export function ProductImage({
  images,
  alt,
  className,
  priority = false,
}: {
  images: ProductImageType[]
  alt: string
  className?: string
  priority?: boolean
}) {
  const primary = [...images].sort((a, b) => a.position - b.position)[0]

  if (!primary) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-muted text-muted-foreground",
          className
        )}
      >
        <Sparkles className="w-8 h-8 opacity-40" aria-hidden="true" />
      </div>
    )
  }

  return (
    <div className={cn("relative overflow-hidden bg-muted", className)}>
      <Image
        src={getProductImageUrl(primary.storage_path)}
        alt={alt}
        fill
        priority={priority}
        loading={priority ? undefined : "lazy"}
        className="object-cover"
        sizes="(max-width: 768px) 50vw, 25vw"
      />
    </div>
  )
}
