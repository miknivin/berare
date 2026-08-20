import Link from "next/link"
import Image from "next/image"
import { getCategories } from "@/lib/data/categories"
import { BUSINESS_INFO } from "@/lib/business-info"

export async function Footer() {
  const categories = await getCategories()
  const topLevelCategories = categories.filter((c) => !c.parent_id)
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-border bg-muted/40 mt-24">
      <div className="mx-auto max-w-7xl px-4 md:px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <Image src="/logo.png" alt="Berare" width={300} height={166} className="h-10 w-auto" />
          <p className="mt-3 text-sm text-muted-foreground">Cosmetics, delivered across India.</p>
        </div>

        <nav aria-label="Footer categories">
          <h3 className="text-sm font-medium mb-3">Shop</h3>
          <ul className="space-y-2">
            <li>
              <Link href="/products" className="text-sm text-muted-foreground hover:text-foreground">
                All Products
              </Link>
            </li>
            {topLevelCategories.map((category) => (
              <li key={category.id}>
                <Link
                  href={`/categories/${category.slug}`}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Customer service">
          <h3 className="text-sm font-medium mb-3">Customer Service</h3>
          <ul className="space-y-2">
            <li>
              <Link href="/account/orders" className="text-sm text-muted-foreground hover:text-foreground">
                Track Order
              </Link>
            </li>
            <li>
              <Link href="/shipping" className="text-sm text-muted-foreground hover:text-foreground">
                Shipping Policy
              </Link>
            </li>
            <li>
              <Link href="/returns" className="text-sm text-muted-foreground hover:text-foreground">
                Cancellation & Refunds
              </Link>
            </li>
            <li>
              <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground">
                Contact Us
              </Link>
            </li>
            {/* Become an Affiliate — commented out, /affiliate-apply hasn't been built yet.
            <li>
              <Link href="/affiliate-apply" className="text-sm text-muted-foreground hover:text-foreground">
                Become an Affiliate
              </Link>
            </li>
            */}
          </ul>
        </nav>

        <nav aria-label="Legal">
          <h3 className="text-sm font-medium mb-3">Legal</h3>
          <ul className="space-y-2">
            <li>
              <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground">
                Terms of Service
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            &copy; {year} {BUSINESS_INFO.legalName}. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            {BUSINESS_INFO.phone} &middot; {BUSINESS_INFO.email}
          </p>
        </div>
      </div>
    </footer>
  )
}
