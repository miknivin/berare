import { Suspense } from "react"
import Link from "next/link"
import Image from "next/image"
import { createServerSupabaseClient } from "@berare/db/server"
import { getCategories } from "@/lib/data/categories"
import { MobileMenu } from "./mobile-menu"
import { SearchBar } from "./search-bar"
import { CartIndicator } from "@/components/cart/cart-indicator"

export async function Navbar() {
  const [categories, supabase] = await Promise.all([
    getCategories(),
    createServerSupabaseClient(),
  ])
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const topLevelCategories = categories.filter((c) => !c.parent_id)

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="flex items-center justify-between h-16 gap-4">
          <div className="flex items-center gap-2">
            <MobileMenu categories={categories} userEmail={user?.email ?? null} />
            <Link href="/" className="flex items-center">
              <Image src="/logo.png" alt="Berare" width={300} height={166} priority className="h-12 w-auto" />
            </Link>
          </div>

          <nav aria-label="Categories" className="hidden md:flex items-center gap-6">
            <Link href="/products" className="text-sm font-medium hover:text-primary transition-colors">
              All Products
            </Link>
            {topLevelCategories.map((category) => (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                {category.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1 md:gap-2">
            <Suspense>
              <SearchBar />
            </Suspense>
            {user ? (
              <Link
                href="/"
                className="hidden md:block text-sm font-medium px-3 py-2 hover:text-primary transition-colors"
              >
                {user.email}
              </Link>
            ) : (
              <Link
                href="/auth/login"
                className="hidden md:block text-sm font-medium px-3 py-2 hover:text-primary transition-colors"
              >
                Sign in
              </Link>
            )}
            <CartIndicator />
          </div>
        </div>
      </div>
    </header>
  )
}
