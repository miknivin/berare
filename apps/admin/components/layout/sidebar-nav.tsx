"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Package, ShoppingCart, Image as ImageIcon, Tags, Users, UsersRound, Star, MessageSquareQuote, Inbox, Banknote, RotateCcw, Settings } from "lucide-react"
import { useMobileSidebar } from "./mobile-sidebar-context"

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/users", label: "Users", icon: UsersRound },
  { href: "/products", label: "Products", icon: Package },
  { href: "/categories", label: "Categories", icon: Tags },
  { href: "/orders", label: "Orders", icon: ShoppingCart },
  { href: "/returns", label: "Returns", icon: RotateCcw },
  { href: "/enquiries", label: "Enquiries", icon: Inbox },
  { href: "/banners", label: "Banners", icon: ImageIcon },
  { href: "/affiliates", label: "Affiliates", icon: Users },
  { href: "/withdrawals", label: "Withdrawals", icon: Banknote },
  { href: "/reviews", label: "Reviews", icon: Star },
  { href: "/testimonials", label: "Testimonials", icon: MessageSquareQuote },
  { href: "/settings", label: "Settings", icon: Settings },
]

export function SidebarNav() {
  const pathname = usePathname()
  const { close } = useMobileSidebar()

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
            onClick={close}
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
