import Link from "next/link"
import type { Category } from "@/lib/data/categories"

export function SubcategoryCards({ subcategories }: { subcategories: Category[] }) {
  if (subcategories.length === 0) return null

  return (
    <div className="flex flex-wrap gap-3 mb-8">
      {subcategories.map((subcategory) => (
        <Link
          key={subcategory.id}
          href={`/categories/${subcategory.slug}`}
          className="rounded-full border border-border px-5 py-2.5 text-sm font-medium hover:border-primary hover:text-primary transition-colors"
        >
          {subcategory.name}
        </Link>
      ))}
    </div>
  )
}
