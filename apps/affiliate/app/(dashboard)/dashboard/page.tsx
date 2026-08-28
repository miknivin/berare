import type { Metadata } from "next"
import { requireActiveAffiliate } from "@/lib/auth"
import { getMyLinks, getMyLedger, availablePointsFrom } from "@/lib/data/affiliate"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = { title: "Dashboard" }

export default async function DashboardPage() {
  const { affiliate } = await requireActiveAffiliate()
  const [links, ledger] = await Promise.all([getMyLinks(affiliate.id), getMyLedger(affiliate.id)])

  const totalClicks = links.reduce((sum, link) => sum + link.clicks_count, 0)
  const totalOrders = links.reduce((sum, link) => sum + link.orders_count, 0)
  const availablePoints = availablePointsFrom(ledger)
  const pendingPoints = ledger
    .filter((entry) => entry.status === "pending" && entry.entry_type === "earned")
    .reduce((sum, entry) => sum + Number(entry.points), 0)

  const stats = [
    { label: "Referral Code", value: affiliate.referral_code, mono: true },
    { label: "Total Clicks", value: totalClicks },
    { label: "Total Orders", value: totalOrders },
    { label: "Available Points", value: availablePoints },
    { label: "Pending Points", value: pendingPoints },
  ]

  return (
    <div>
      <h1 className="text-xl font-semibold mb-6">Dashboard</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className={stat.mono ? "text-lg font-mono font-semibold" : "text-2xl font-semibold"}>
                {stat.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
