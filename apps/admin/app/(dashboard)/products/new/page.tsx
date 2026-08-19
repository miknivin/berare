import Link from "next/link"
import type { Metadata } from "next"
import { ArrowLeft } from "lucide-react"
import { requireStaff } from "@/lib/auth"
import { getCategories } from "@/lib/data/categories"
import { ProductForm } from "@/components/products/product-form"

export const metadata: Metadata = { title: "New Product" }

export default async function NewProductPage() {
  await requireStaff()
  const categories = await getCategories()

  return (
    <div>
      <Link
        href="/products"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft className="w-4 h-4" aria-hidden="true" />
        Back to Products
      </Link>
      <h1 className="text-xl font-semibold mb-6">New Product</h1>
      <ProductForm categories={categories} />
    </div>
  )
}
