import { AdminSidebar } from "@/components/layout/admin-sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider>
      <div className="flex-1 flex">
        <AdminSidebar />
        <main className="flex-1 min-w-0 ml-56 px-8 py-8">{children}</main>
      </div>
    </TooltipProvider>
  )
}
