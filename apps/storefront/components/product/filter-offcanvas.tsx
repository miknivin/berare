"use client"

import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { SlidersHorizontal, X } from "lucide-react"
import { ProductFilters, type PlainProductFilters } from "@/lib/data/product-filters"
import type { Category } from "@/lib/data/categories"

export function FilterOffcanvas({
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
  const [open, setOpen] = useState(false)

  // Batch-apply pattern: local pending state only, URL/backend only see
  // it once "Apply Filters" is pressed — avoids re-fetching on every
  // checkbox click.
  const [pendingCategories, setPendingCategories] = useState<string[]>(filters.categorySlugs)
  const [pendingMin, setPendingMin] = useState(filters.minPrice?.toString() ?? "")
  const [pendingMax, setPendingMax] = useState(filters.maxPrice?.toString() ?? "")

  const topLevelCategories = categories.filter((c) => !c.parent_id)

  function openPanel() {
    // Reset pending state to whatever's actually active whenever reopened.
    setPendingCategories(filters.categorySlugs)
    setPendingMin(filters.minPrice?.toString() ?? "")
    setPendingMax(filters.maxPrice?.toString() ?? "")
    setOpen(true)
  }

  function toggleCategory(slug: string) {
    setPendingCategories((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    )
  }

  function applyFilters() {
    const next = new ProductFilters({
      categorySlugs: pendingCategories,
      minPrice: pendingMin ? Number(pendingMin) : undefined,
      maxPrice: pendingMax ? Number(pendingMax) : undefined,
      search: filters.search,
      sort: filters.sort,
      // A changed filter set invalidates the current page number.
      page: 1,
    })
    const query = new URLSearchParams(next.toSearchParams()).toString()
    router.push(query ? `${pathname}?${query}` : pathname)
    setOpen(false)
  }

  function clearFilters() {
    setPendingCategories([])
    setPendingMin("")
    setPendingMax("")
  }

  return (
    <>
      <button
        type="button"
        onClick={openPanel}
        className="relative flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
      >
        <SlidersHorizontal className="w-4 h-4" aria-hidden="true" />
        Filters
        {filters.activeFilterCount() > 0 && (
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-[11px] font-medium">
            {filters.activeFilterCount()}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Filter products">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} aria-hidden="true" />

          <div className="absolute right-0 top-0 bottom-0 w-[85%] max-w-sm bg-background flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="font-heading font-bold text-lg">Filters</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close filters"
                className="flex items-center justify-center w-9 h-9 -mr-2"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-8">
              {topLevelCategories.length > 0 && (
                <fieldset>
                  <legend className="text-sm font-medium mb-3">Category</legend>
                  <div className="space-y-2.5">
                    {topLevelCategories.map((category) => (
                      <label key={category.id} className="flex items-center gap-3 text-sm cursor-pointer">
                        <input
                          type="checkbox"
                          checked={pendingCategories.includes(category.slug)}
                          onChange={() => toggleCategory(category.slug)}
                          className="w-4 h-4 accent-primary shrink-0"
                        />
                        {category.name}
                      </label>
                    ))}
                  </div>
                </fieldset>
              )}

              <fieldset>
                <legend className="text-sm font-medium mb-3">Price</legend>
                <div className="flex items-center gap-3">
                  <label className="flex-1">
                    <span className="block text-xs text-muted-foreground mb-1">Min</span>
                    <input
                      type="number"
                      min="0"
                      inputMode="numeric"
                      value={pendingMin}
                      onChange={(e) => setPendingMin(e.target.value)}
                      placeholder="0"
                      className="w-full min-h-11 rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </label>
                  <span className="text-muted-foreground mt-5">–</span>
                  <label className="flex-1">
                    <span className="block text-xs text-muted-foreground mb-1">Max</span>
                    <input
                      type="number"
                      min="0"
                      inputMode="numeric"
                      value={pendingMax}
                      onChange={(e) => setPendingMax(e.target.value)}
                      placeholder="Any"
                      className="w-full min-h-11 rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </label>
                </div>
              </fieldset>
            </div>

            <div className="p-4 border-t border-border flex gap-3">
              <button
                type="button"
                onClick={clearFilters}
                className="flex-1 min-h-11 rounded-full border border-border text-sm font-medium hover:bg-muted transition-colors"
              >
                Clear All
              </button>
              <button
                type="button"
                onClick={applyFilters}
                className="flex-1 min-h-11 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary-hover transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
