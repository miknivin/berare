import type { Metadata } from "next"
import Image from "next/image"
import { Pencil } from "lucide-react"
import { requireStaff } from "@/lib/auth"
import { getCategories, getCategoriesWithMeta } from "@/lib/data/categories"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CategoryDialog } from "@/components/categories/category-dialog"
import { CategoryDeleteButton } from "@/components/categories/category-delete-button"
import { PaginationNav } from "@/components/shared/pagination-nav"
import { PageSizeSelect } from "@/components/shared/page-size-select"
import { DEFAULT_PAGE_SIZE, parsePageSize } from "@/lib/pagination"

export const metadata: Metadata = { title: "Categories" }

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; pageSize?: string }>
}) {
  await requireStaff()
  const { page: pageParam, pageSize: pageSizeParam } = await searchParams
  const page = Math.max(1, Number(pageParam) || 1)
  const pageSize = parsePageSize(pageSizeParam)

  // The parent-category dropdown needs every category regardless of which
  // page is being viewed, so it's fetched unpaginated separately from the
  // table's own paginated slice.
  const [allCategories, { categories, total, totalPages }] = await Promise.all([
    getCategories(),
    getCategoriesWithMeta(page, pageSize),
  ])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Categories</h1>
          <p className="text-sm text-muted-foreground">{total} categories</p>
        </div>
        <CategoryDialog categories={allCategories} trigger={<Button type="button">New Category</Button>} />
      </div>

      <div className="flex justify-end mb-3">
        <PageSizeSelect pageSize={pageSize} basePath="/categories" defaultPageSize={DEFAULT_PAGE_SIZE} />
      </div>

      {categories.length === 0 ? (
        <p className="text-sm text-muted-foreground">No categories yet.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Parent</TableHead>
              <TableHead>Products</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell>
                  <div className="relative w-11 h-11 rounded-md overflow-hidden bg-muted">
                    {category.image_url && (
                      <Image src={category.image_url} alt="" fill unoptimized className="object-cover" />
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-medium">{category.name}</TableCell>
                <TableCell className="text-muted-foreground">{category.parent_name ?? "—"}</TableCell>
                <TableCell>{category.product_count}</TableCell>
                <TableCell className="text-right">
                  <div className="inline-flex items-center gap-2">
                    <CategoryDialog
                      categories={allCategories.filter((c) => c.id !== category.id)}
                      category={category}
                      initialImageUrl={category.image_url}
                      tooltipLabel="Edit"
                      trigger={
                        <Button type="button" variant="ghost" size="icon-sm" aria-label="Edit">
                          <Pencil className="w-4 h-4" aria-hidden="true" />
                        </Button>
                      }
                    />
                    <CategoryDeleteButton id={category.id} name={category.name} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <PaginationNav
        page={page}
        totalPages={totalPages}
        basePath="/categories"
        pageSize={pageSize}
        defaultPageSize={DEFAULT_PAGE_SIZE}
      />
    </div>
  )
}
