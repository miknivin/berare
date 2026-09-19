import Link from "next/link"
import type { Metadata } from "next"
import { Pencil } from "lucide-react"
import { requireStaff } from "@/lib/auth"
import { getProducts, type ProductStatus } from "@/lib/data/products"
import { getCategories } from "@/lib/data/categories"
import { formatPrice } from "@/lib/format"
import { buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ProductStatusToggle } from "@/components/products/product-status-toggle"
import { ProductDeleteButton } from "@/components/products/product-delete-button"
import { ProductFiltersBar } from "@/components/products/product-filters-bar"
import { PaginationNav } from "@/components/shared/pagination-nav"
import { PageSizeSelect } from "@/components/shared/page-size-select"
import { IconTooltipButton } from "@/components/shared/icon-tooltip-button"
import { DEFAULT_PAGE_SIZE, parsePageSize } from "@/lib/pagination"

export const metadata: Metadata = { title: "Products" }

const STATUS_VARIANT = {
  active: "default",
  draft: "secondary",
  disabled: "destructive",
} as const

const VALID_STATUSES: ProductStatus[] = ["draft", "active", "disabled"]

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; pageSize?: string; search?: string; status?: string; category?: string }>
}) {
  await requireStaff()
  const {
    page: pageParam,
    pageSize: pageSizeParam,
    search,
    status: statusParam,
    category: categoryId,
  } = await searchParams
  const page = Math.max(1, Number(pageParam) || 1)
  const pageSize = parsePageSize(pageSizeParam)
  const status = VALID_STATUSES.find((s) => s === statusParam)

  const [{ products, total, totalPages }, categories] = await Promise.all([
    getProducts(page, pageSize, { search, status, categoryId }),
    getCategories(),
  ])

  const extraParams: Record<string, string> = {}
  if (search) extraParams.search = search
  if (status) extraParams.status = status
  if (categoryId) extraParams.category = categoryId

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Products</h1>
          <p className="text-sm text-muted-foreground">{total} products</p>
        </div>
        <Link href="/products/new" className={buttonVariants()}>
          New Product
        </Link>
      </div>

      <ProductFiltersBar categories={categories} />

      <div className="flex justify-end mb-3">
        <PageSizeSelect
          pageSize={pageSize}
          basePath="/products"
          defaultPageSize={DEFAULT_PAGE_SIZE}
          extraParams={extraParams}
        />
      </div>

      {products.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {search || status || categoryId ? "No products match these filters." : "No products yet."}
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">
                  <Link href={`/products/${product.id}`} className="hover:underline">
                    {product.name}
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {product.categories?.name ?? "—"}
                </TableCell>
                <TableCell>{formatPrice(product.price)}</TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[product.status]}>{product.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="inline-flex items-center gap-2">
                    <ProductStatusToggle id={product.id} status={product.status} />
                    <IconTooltipButton
                      label="Edit"
                      render={
                        <Link
                          href={`/products/${product.id}`}
                          className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
                          aria-label="Edit"
                        />
                      }
                    >
                      <Pencil className="w-4 h-4" aria-hidden="true" />
                    </IconTooltipButton>
                    <ProductDeleteButton id={product.id} name={product.name} />
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
        basePath="/products"
        pageSize={pageSize}
        defaultPageSize={DEFAULT_PAGE_SIZE}
        extraParams={extraParams}
      />
    </div>
  )
}
