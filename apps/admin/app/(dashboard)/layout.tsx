import { AdminSidebar } from "@/components/layout/admin-sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { MobileSidebarProvider } from "@/components/layout/mobile-sidebar-context"
import { MobileTopBar } from "@/components/layout/mobile-topbar"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider>
      <MobileSidebarProvider>
        <div className="flex-1 flex flex-col">
          <MobileTopBar />
          <div className="flex-1 flex">
            <AdminSidebar />
            <main className="flex-1 min-w-0 md:ml-56 px-4 md:px-8 py-6 md:py-8">{children}</main>
          </div>
        </div>
      </MobileSidebarProvider>
    </TooltipProvider>
  )
}
