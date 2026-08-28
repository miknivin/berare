"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Package, ShoppingCart, Image as ImageIcon, Tags, Users } from "lucide-react"

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/products", label: "Products", icon: Package },
  { href: "/categories", label: "Categories", icon: Tags },
  { href: "/orders", label: "Orders", icon: ShoppingCart },
  { href: "/banners", label: "Banners", icon: ImageIcon },
  { href: "/affiliates", label: "Affiliates", icon: Users },
]

export function SidebarNav() {
  const pathname = usePathname()

  return (
    <nav className="flex-1 p-3 space-y-1">
      {NAV_ITEMS.map((item) => {
        // Only the dashboard root needs an exact match — every other
        // section (e.g. /products/[id]) should still highlight its parent.
        const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
