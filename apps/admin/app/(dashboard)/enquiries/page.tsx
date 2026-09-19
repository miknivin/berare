import type { Metadata } from "next"
import { requireStaff } from "@/lib/auth"
import { getEnquiries } from "@/lib/data/enquiries"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { PaginationNav } from "@/components/shared/pagination-nav"
import { PageSizeSelect } from "@/components/shared/page-size-select"
import { DEFAULT_PAGE_SIZE, parsePageSize } from "@/lib/pagination"

export const metadata: Metadata = { title: "Enquiries" }

export default async function EnquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; pageSize?: string }>
}) {
  await requireStaff()
  const { page: pageParam, pageSize: pageSizeParam } = await searchParams
  const page = Math.max(1, Number(pageParam) || 1)
  const pageSize = parsePageSize(pageSizeParam)

  const { enquiries, total, totalPages } = await getEnquiries(page, pageSize)

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold">Enquiries</h1>
        <p className="text-sm text-muted-foreground">{total} enquiries</p>
      </div>

      <div className="flex justify-end mb-3">
        <PageSizeSelect pageSize={pageSize} basePath="/enquiries" defaultPageSize={DEFAULT_PAGE_SIZE} />
      </div>

      {enquiries.length === 0 ? (
        <p className="text-sm text-muted-foreground">No enquiries yet.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Received</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {enquiries.map((enquiry) => (
              <TableRow key={enquiry.id}>
                <TableCell className="font-medium">{enquiry.name}</TableCell>
                <TableCell>{enquiry.phone ?? "—"}</TableCell>
                <TableCell>{enquiry.email ?? "—"}</TableCell>
                <TableCell className="max-w-xs truncate text-muted-foreground">
                  {enquiry.message ?? "—"}
                </TableCell>
                <TableCell className="text-muted-foreground text-xs">{enquiry.source ?? "—"}</TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {new Date(enquiry.created_at).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <PaginationNav
        page={page}
        totalPages={totalPages}
        basePath="/enquiries"
        pageSize={pageSize}
        defaultPageSize={DEFAULT_PAGE_SIZE}
      />
    </div>
  )
}
