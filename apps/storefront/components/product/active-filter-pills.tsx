"use client"

import { useRouter, usePathname } from "next/navigation"
import { X } from "lucide-react"
import { ProductFilters, type PlainProductFilters } from "@/lib/data/product-filters"
import type { Category } from "@/lib/data/categories"

export function ActiveFilterPills({
  categories,
  filters: plainFilters,
}: {
  categories: Category[]
  filters: PlainProductFilters
}) {
  // Server Components can only pass plain objects across to Client
  // Components — reconstruct the class here to get its methods back.
  const filters = new ProductFilters(plainFilters)
  const router = useRouter()
  const pathname = usePathname()

  if (!filters.hasActiveFilters()) return null

  function push(next: ProductFilters) {
    const query = new URLSearchParams(next.toSearchParams()).toString()
    router.push(query ? `${pathname}?${query}` : pathname)
  }

  function removeCategory(slug: string) {
    push(
      new ProductFilters({
        ...filters,
        categorySlugs: filters.categorySlugs.filter((s) => s !== slug),
        page: 1,
      })
    )
  }

  function clearPrice() {
    push(new ProductFilters({ ...filters, minPrice: undefined, maxPrice: undefined, page: 1 }))
  }

  function clearAll() {
    push(new ProductFilters({ search: filters.search, sort: filters.sort }))
  }

  const priceLabel =
    filters.minPrice !== undefined || filters.maxPrice !== undefined
      ? `₹${filters.minPrice ?? 0} – ${filters.maxPrice !== undefined ? `₹${filters.maxPrice}` : "Any"}`
      : null

  return (
    <div className="flex flex-wrap items-center gap-2 mb-6">
      {filters.categorySlugs.map((slug) => {
        const category = categories.find((c) => c.slug === slug)
        if (!category) return null
        return (
          <Pill key={slug} label={category.name} onRemove={() => removeCategory(slug)} />
        )
      })}
      {priceLabel && <Pill label={priceLabel} onRemove={clearPrice} />}
      <button
        type="button"
        onClick={clearAll}
        className="text-xs font-medium text-muted-foreground hover:text-foreground underline underline-offset-2"
      >
        Clear all
      </button>
    </div>
  )
}

function Pill({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-muted pl-3 pr-2 py-1.5 text-xs font-medium">
      {label}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${label} filter`}
        className="flex items-center justify-center w-4 h-4 hover:text-primary"
      >
        <X className="w-3 h-3" aria-hidden="true" />
      </button>
    </span>
  )
}
