import { requireActiveAffiliate } from "@/lib/auth"
import { AffiliateSidebar } from "@/components/layout/affiliate-sidebar"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await requireActiveAffiliate()

  return (
    <div className="flex-1 flex">
      <AffiliateSidebar />
      <main className="flex-1 min-w-0 ml-56 px-8 py-8">{children}</main>
    </div>
  )
}
