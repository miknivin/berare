import Link from "next/link"
import type { ProductFilters } from "@/lib/data/product-filters"

export function Pagination({
  totalPages,
  basePath,
  filters,
}: {
  totalPages: number
  basePath: string
  filters: ProductFilters
}) {
  if (totalPages <= 1) return null

  function hrefFor(targetPage: number) {
    const params = new URLSearchParams(filters.toSearchParams({ page: targetPage }))
    const query = params.toString()
    return query ? `${basePath}?${query}` : basePath
  }

  const page = filters.page

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-2 mt-10">
      <Link
        href={hrefFor(Math.max(1, page - 1))}
        aria-disabled={page === 1}
        className={`min-h-11 px-4 flex items-center rounded-full border border-border text-sm ${
          page === 1 ? "pointer-events-none opacity-40" : "hover:bg-muted"
        }`}
      >
        Previous
      </Link>
      <span className="text-sm text-muted-foreground px-2">
        Page {page} of {totalPages}
      </span>
      <Link
        href={hrefFor(Math.min(totalPages, page + 1))}
        aria-disabled={page === totalPages}
        className={`min-h-11 px-4 flex items-center rounded-full border border-border text-sm ${
          page === totalPages ? "pointer-events-none opacity-40" : "hover:bg-muted"
        }`}
      >
        Next
      </Link>
    </nav>
  )
}
