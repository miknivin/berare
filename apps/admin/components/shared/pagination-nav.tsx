import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function PaginationNav({
  page,
  totalPages,
  basePath,
  pageSize,
  defaultPageSize,
}: {
  page: number
  totalPages: number
  basePath: string
  /** Current page size — preserved on Previous/Next so it isn't lost on navigation. */
  pageSize?: number
  defaultPageSize?: number
}) {
  if (totalPages <= 1) return null

  function hrefFor(targetPage: number) {
    const params = new URLSearchParams()
    if (targetPage > 1) params.set("page", String(targetPage))
    if (pageSize && pageSize !== defaultPageSize) params.set("pageSize", String(pageSize))
    const query = params.toString()
    return query ? `${basePath}?${query}` : basePath
  }

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-2 mt-6">
      <Link
        href={hrefFor(Math.max(1, page - 1))}
        aria-disabled={page === 1}
        className={cn(
          buttonVariants({ variant: "outline", size: "sm" }),
          page === 1 && "pointer-events-none opacity-40"
        )}
      >
        Previous
      </Link>
      <span className="text-sm text-muted-foreground px-2">
        Page {page} of {totalPages}
      </span>
      <Link
        href={hrefFor(Math.min(totalPages, page + 1))}
        aria-disabled={page === totalPages}
        className={cn(
          buttonVariants({ variant: "outline", size: "sm" }),
          page === totalPages && "pointer-events-none opacity-40"
        )}
      >
        Next
      </Link>
    </nav>
  )
}
