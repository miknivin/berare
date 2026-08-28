"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Link2, Wallet, LogOut } from "lucide-react"

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/links", label: "Links", icon: Link2 },
  { href: "/earnings", label: "Earnings", icon: Wallet },
]

export function AffiliateSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-56 shrink-0 h-svh fixed inset-y-0 left-0 border-r border-border bg-muted/30 flex flex-col overflow-y-auto">
      <Link href="/dashboard" className="p-5 border-b border-border flex items-center">
        <Image src="/logo.png" alt="Berare" width={116} height={64} priority unoptimized className="h-8 w-auto" />
      </Link>

      <nav className="flex-1 p-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href)
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

      <div className="p-4 border-t border-border">
        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <LogOut className="w-4 h-4" aria-hidden="true" />
            Sign out
          </button>
        </form>
      </div>
    </aside>
  )
}
