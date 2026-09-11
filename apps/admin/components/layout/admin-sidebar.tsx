import Link from "next/link"
import Image from "next/image"
import { LogOut } from "lucide-react"
import { requireStaff } from "@/lib/auth"
import { SidebarNav } from "./sidebar-nav"
import { SidebarFrame } from "./sidebar-frame"

export async function AdminSidebar() {
  const { user, staff } = await requireStaff()

  return (
    <SidebarFrame>
      <Link href="/" className="p-5 border-b border-border flex items-center">
        <Image
          src="/logo.png"
          alt="Berare"
          width={116}
          height={64}
          priority
          unoptimized
          className="h-8 w-auto"
        />
      </Link>

      <SidebarNav />

      <div className="p-4 border-t border-border">
        <p className="text-sm font-medium truncate">{user.email}</p>
        <p className="text-xs text-muted-foreground capitalize mb-3">{staff.role}</p>
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
    </SidebarFrame>
  )
}
