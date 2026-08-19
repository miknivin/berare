import type { Category } from "./categories"

export type SortOption = "newest" | "price-asc" | "price-desc" | "name-asc"

const VALID_SORTS: SortOption[] = ["newest", "price-asc", "price-desc", "name-asc"]
const PAGE_SIZE = 12

type RawSearchParams = Record<string, string | string[] | undefined>

// Plain-object mirror of ProductFilters' fields — React Server Components
// can only pass plain objects across the server→client boundary, not
// class instances (methods/prototype don't survive serialization). Client
// Components receive this shape and do `new ProductFilters(plain)`
// locally to get the methods back.
export type PlainProductFilters = {
  categorySlugs: string[]
  minPrice?: number
  maxPrice?: number
  search?: string
  sort: SortOption
  page: number
}

// Any Supabase query builder shape narrow enough to chain .in/.gte/.lte/
// .ilike/.order/.range on — kept loose deliberately so this class isn't
// coupled to one exact generic instantiation of PostgrestFilterBuilder,
// which changes shape after every chained call.
type FilterableQuery = {
  in: (column: string, values: string[]) => FilterableQuery
  gte: (column: string, value: number) => FilterableQuery
  lte: (column: string, value: number) => FilterableQuery
  ilike: (column: string, pattern: string) => FilterableQuery
  order: (column: string, opts: { ascending: boolean }) => FilterableQuery
  range: (from: number, to: number) => FilterableQuery
}

/**
 * Single source of truth for product listing filters — parsing from URL
 * search params, serializing back to them (so pagination/category links
 * and the filter form can't drift out of sync with what the backend
 * reads), and applying itself to a Supabase query. Used by both
 * /products and /categories/[slug], and by the FilterOffcanvas form.
 */
export class ProductFilters {
  categorySlugs: string[]
  minPrice?: number
  maxPrice?: number
  search?: string
  sort: SortOption
  page: number

  constructor(
    input: {
      categorySlugs?: string[]
      minPrice?: number
      maxPrice?: number
      search?: string
      sort?: SortOption
      page?: number
    } = {}
  ) {
    this.categorySlugs = input.categorySlugs ?? []
    this.minPrice = input.minPrice
    this.maxPrice = input.maxPrice
    this.search = input.search
    this.sort = input.sort && VALID_SORTS.includes(input.sort) ? input.sort : "newest"
    this.page = Math.max(1, input.page ?? 1)
  }

  static fromSearchParams(sp: RawSearchParams): ProductFilters {
    const get = (key: string): string | undefined => {
      const v = sp[key]
      return typeof v === "string" ? v : undefined
    }

    const categoriesParam = get("categories")
    const minPrice = get("minPrice")
    const maxPrice = get("maxPrice")
    const page = get("page")

    return new ProductFilters({
      categorySlugs: categoriesParam ? categoriesParam.split(",").filter(Boolean) : [],
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      search: get("search"),
      sort: get("sort") as SortOption | undefined,
      page: page ? Number(page) : undefined,
    })
  }

  // Plain string→string query params — used to build pagination/category
  // links and to push updated filters from the offcanvas form to the URL.
  toSearchParams(overrides: { page?: number } = {}): Record<string, string> {
    const params: Record<string, string> = {}
    if (this.categorySlugs.length > 0) params.categories = this.categorySlugs.join(",")
    if (this.minPrice !== undefined) params.minPrice = String(this.minPrice)
    if (this.maxPrice !== undefined) params.maxPrice = String(this.maxPrice)
    if (this.search) params.search = this.search
    if (this.sort !== "newest") params.sort = this.sort

    const page = overrides.page ?? this.page
    if (page > 1) params.page = String(page)

    return params
  }

  toPlainObject(): PlainProductFilters {
    return {
      categorySlugs: this.categorySlugs,
      minPrice: this.minPrice,
      maxPrice: this.maxPrice,
      search: this.search,
      sort: this.sort,
      page: this.page,
    }
  }

  get pageSize() {
    return PAGE_SIZE
  }

  get offset() {
    return (this.page - 1) * PAGE_SIZE
  }

  hasActiveFilters(): boolean {
    return this.categorySlugs.length > 0 || this.minPrice !== undefined || this.maxPrice !== undefined
  }

  activeFilterCount(): number {
    return this.categorySlugs.length + (this.minPrice !== undefined ? 1 : 0) + (this.maxPrice !== undefined ? 1 : 0)
  }

  /**
   * Applies category/price/search/sort/pagination to a Supabase query
   * builder for `products`. `categories` is the already-fetched category
   * list, used to resolve slugs to ids.
   */
  apply<T extends FilterableQuery>(query: T, categories: Category[]): T {
    let q: FilterableQuery = query

    if (this.categorySlugs.length > 0) {
      const ids = categories.filter((c) => this.categorySlugs.includes(c.slug)).map((c) => c.id)
      // Unknown/empty slugs resolve to no matches rather than all products.
      q = q.in("category_id", ids.length > 0 ? ids : ["00000000-0000-0000-0000-000000000000"])
    }

    if (this.minPrice !== undefined) q = q.gte("price", this.minPrice)
    if (this.maxPrice !== undefined) q = q.lte("price", this.maxPrice)
    if (this.search) q = q.ilike("name", `%${this.search}%`)

    switch (this.sort) {
      case "price-asc":
        q = q.order("price", { ascending: true })
        break
      case "price-desc":
        q = q.order("price", { ascending: false })
        break
      case "name-asc":
        q = q.order("name", { ascending: true })
        break
      case "newest":
      default:
        q = q.order("created_at", { ascending: false })
    }

    return q.range(this.offset, this.offset + this.pageSize - 1) as T
  }
}
