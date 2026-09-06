import { Suspense } from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, User } from "lucide-react"
import { getCategories } from "@/lib/data/categories"
import { getCurrentUser } from "@/lib/data/auth"
import { MobileMenu } from "./mobile-menu"
import { SearchBar } from "./search-bar"
import { UserMenuButton } from "./user-menu-button"
import { CartIndicator } from "@/components/cart/cart-indicator"
import { WishlistIndicator } from "@/components/product/wishlist-indicator"

// The header shell itself is fully synchronous — it never blocks on
// Supabase or the categories query. Each data-dependent piece resolves
// independently inside its own Suspense boundary, so the rest of the page
// (and the rest of the navbar) can stream in immediately instead of
// waiting on auth/category lookups.
export function Navbar() {
  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="flex items-center justify-between h-16 gap-4">
          <div className="flex items-center gap-2">
            <Suspense fallback={<MobileMenuFallback />}>
              <NavMobileMenu />
            </Suspense>
            <Link href="/" className="flex items-center">
              <Image src="/logo.png" alt="Berare" width={300} height={166} priority className="h-12 w-auto" />
            </Link>
          </div>

          <Suspense fallback={null}>
            <DesktopCategoryNav />
          </Suspense>

          <div className="flex items-center gap-1 md:gap-2">
            <Suspense>
              <SearchBar />
            </Suspense>
            <Suspense fallback={<UserMenuFallback />}>
              <NavUserMenu />
            </Suspense>
            <WishlistIndicator />
            <CartIndicator />
          </div>
        </div>
      </div>
    </header>
  )
}

async function NavMobileMenu() {
  const [categories, user] = await Promise.all([getCategories(), getCurrentUser()])
  return <MobileMenu categories={categories} userEmail={user?.email ?? null} />
}

function MobileMenuFallback() {
  return (
    <div className="md:hidden flex items-center justify-center w-11 h-11 -ml-2" aria-hidden="true">
      <Menu className="w-5 h-5 text-muted-foreground" />
    </div>
  )
}

async function DesktopCategoryNav() {
  const categories = await getCategories()
  const topLevelCategories = categories.filter((c) => !c.parent_id)

  return (
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
  )
}

async function NavUserMenu() {
  const user = await getCurrentUser()
  return <UserMenuButton isLoggedIn={!!user} />
}

function UserMenuFallback() {
  return (
    <div
      className="hidden md:flex items-center justify-center w-10 h-10 rounded-full"
      aria-hidden="true"
    >
      <User className="w-5 h-5 text-muted-foreground" />
    </div>
  )
}
