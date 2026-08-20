import Link from "next/link"
import type { Metadata } from "next"
import { createServerSupabaseClient } from "@berare/db/server"
import { getCurrentProfile } from "@/lib/data/profile"
import { getOrdersForCurrentUser } from "@/lib/data/orders"
import { formatPrice } from "@/lib/format"

export const metadata: Metadata = { title: "Your Account" }

export default async function AccountPage() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const [profile, orders] = await Promise.all([getCurrentProfile(), getOrdersForCurrentUser()])
  const recentOrders = orders.slice(0, 3)

  return (
    <div>
      <h1 className="font-heading text-2xl md:text-3xl mb-1">
        {profile?.full_name ? `Hi, ${profile.full_name.split(" ")[0]}` : "Your Account"}
      </h1>
      <p className="text-sm text-muted-foreground mb-8">{user?.email}</p>

      {recentOrders.length > 0 ? (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium">Recent Orders</h2>
            <Link href="/account/orders" className="text-xs font-medium text-primary hover:underline">
              View all
            </Link>
          </div>
          <ul className="space-y-2">
            {recentOrders.map((order) => (
              <li key={order.id}>
                <Link
                  href={`/account/orders/${order.id}`}
                  className="flex items-center justify-between gap-4 rounded-lg border border-border p-3 hover:border-primary/40 transition-colors text-sm"
                >
                  <span className="font-mono text-xs text-muted-foreground">{order.id.slice(0, 8)}</span>
                  <span className="text-muted-foreground">
                    {new Date(order.created_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                  <span className="font-medium">{formatPrice(order.total_amount)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">You haven&apos;t placed any orders yet.</p>
      )}
    </div>
  )
}
