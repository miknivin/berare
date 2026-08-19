import { ProductGrid } from "./product-grid";
import { SortSelect } from "./sort-select";
import { Pagination } from "./pagination";
import { FilterOffcanvas } from "./filter-offcanvas";
import { ActiveFilterPills } from "./active-filter-pills";
import { SubcategoryCards } from "./subcategory-cards";
import type { ProductListItem } from "@/lib/data/products";
import type { ProductFilters } from "@/lib/data/product-filters";
import type { Category } from "@/lib/data/categories";

export function ProductListing({
  title,
  products,
  total,
  totalPages,
  filters,
  basePath,
  categories,
  subcategories = [],
}: {
  title: string;
  products: ProductListItem[];
  total: number;
  totalPages: number;
  filters: ProductFilters;
  basePath: string;
  categories: Category[];
  subcategories?: Category[];
}) {
  return (
    <div className="mx-auto max-w-7xl px-4 w-full md:px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl">{title}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {total} product{total === 1 ? "" : "s"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <FilterOffcanvas
            categories={categories}
            filters={filters.toPlainObject()}
          />
          <SortSelect current={filters.sort} />
        </div>
      </div>

      <SubcategoryCards subcategories={subcategories} />

      <ActiveFilterPills
        categories={categories}
        filters={filters.toPlainObject()}
      />

      <ProductGrid products={products} />

      <Pagination
        totalPages={totalPages}
        basePath={basePath}
        filters={filters}
      />
    </div>
  );
}
