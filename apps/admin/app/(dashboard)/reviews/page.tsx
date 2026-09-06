import type { Metadata } from "next"
import Link from "next/link"
import { requireStaff } from "@/lib/auth"
import { getReviews } from "@/lib/data/reviews"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ReviewDeleteButton } from "@/components/reviews/review-delete-button"
import { PaginationNav } from "@/components/shared/pagination-nav"
import { PageSizeSelect } from "@/components/shared/page-size-select"
import { DEFAULT_PAGE_SIZE, parsePageSize } from "@/lib/pagination"

export const metadata: Metadata = { title: "Reviews" }

export default async function ReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; pageSize?: string }>
}) {
  await requireStaff()
  const { page: pageParam, pageSize: pageSizeParam } = await searchParams
  const page = Math.max(1, Number(pageParam) || 1)
  const pageSize = parsePageSize(pageSizeParam)

  const { reviews, total, totalPages } = await getReviews(page, pageSize)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Reviews</h1>
          <p className="text-sm text-muted-foreground">{total} product reviews</p>
        </div>
      </div>

      <div className="flex justify-end mb-3">
        <PageSizeSelect pageSize={pageSize} basePath="/reviews" defaultPageSize={DEFAULT_PAGE_SIZE} />
      </div>

      {reviews.length === 0 ? (
        <p className="text-sm text-muted-foreground">No reviews yet.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Reviewer</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Review</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reviews.map((review) => (
              <TableRow key={review.id}>
                <TableCell>
                  {review.products ? (
                    <Link href={`/products/${review.products.id}`} className="hover:underline">
                      {review.products.name}
                    </Link>
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell className="font-medium">{review.reviewer_name}</TableCell>
                <TableCell>{review.rating} / 5</TableCell>
                <TableCell className="max-w-90">
                  {review.title && <p className="font-medium text-sm">{review.title}</p>}
                  <p className="text-sm text-muted-foreground truncate">{review.body}</p>
                </TableCell>
                <TableCell className="text-right">
                  <ReviewDeleteButton id={review.id} reviewerName={review.reviewer_name} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <PaginationNav
        page={page}
        totalPages={totalPages}
        basePath="/reviews"
        pageSize={pageSize}
        defaultPageSize={DEFAULT_PAGE_SIZE}
      />
    </div>
  )
}
