import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { ArrowLeft } from "lucide-react"
import { requireStaff } from "@/lib/auth"
import { getCategories } from "@/lib/data/categories"
import { getProductById } from "@/lib/data/products"
import { ProductForm } from "@/components/products/product-form"
import { ProductImagesManager } from "@/components/products/product-images-manager"

export const metadata: Metadata = { title: "Edit Product" }

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireStaff()
  const { id } = await params

  const [categories, product] = await Promise.all([getCategories(), getProductById(id)])
  if (!product) notFound()

  return (
    <div className="max-w-xl">
      <Link
        href="/products"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft className="w-4 h-4" aria-hidden="true" />
        Back to Products
      </Link>
      <h1 className="text-xl font-semibold mb-6">Edit Product</h1>
      <ProductForm categories={categories} product={product} />

      <div className="mt-10 pt-8 border-t border-border">
        <h2 className="text-sm font-medium mb-3">Images</h2>
        <ProductImagesManager productId={product.id} images={product.images} />
      </div>
    </div>
  )
}
