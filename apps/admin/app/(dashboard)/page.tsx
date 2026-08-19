import Link from "next/link"
import { Package, ShoppingCart, Clock, Image as ImageIcon } from "lucide-react"
import { requireStaff } from "@/lib/auth"
import { getProductsCount } from "@/lib/data/products"
import { getOrders, getRecentOrders } from "@/lib/data/orders"
import { getHeroBanners } from "@/lib/data/hero-banners"
import { getRecentUsers } from "@/lib/data/users"
import { formatPrice } from "@/lib/format"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const ORDER_STATUS_VARIANT = {
  pending: "secondary",
  confirmed: "default",
  shipped: "default",
  delivered: "default",
  cancelled: "destructive",
} as const

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export default async function DashboardPage() {
  const { staff } = await requireStaff()
  const [productsCount, orders, banners, recentOrders, recentUsers] = await Promise.all([
    getProductsCount(),
    getOrders(),
    getHeroBanners(),
    getRecentOrders(10),
    getRecentUsers(10),
  ])

  const pendingOrders = orders.filter((o) => o.status === "pending").length

  const stats = [
    { href: "/products", label: "Products", value: productsCount, hint: "total products", icon: Package },
    { href: "/orders", label: "Orders", value: orders.length, hint: "total orders", icon: ShoppingCart },
    { href: "/orders", label: "Pending", value: pendingOrders, hint: "awaiting payment", icon: Clock },
    { href: "/banners", label: "Banners", value: banners.length, hint: "hero banners", icon: ImageIcon },
  ]

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-1">Dashboard</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Signed in as <span className="capitalize">{staff.role}</span>
      </p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="hover:ring-2 hover:ring-primary/30 transition-shadow">
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
                <stat.icon className="w-4 h-4 text-primary" aria-hidden="true" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.hint}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Recent Orders</CardTitle>
            <Link href="/orders" className="text-xs font-medium text-primary hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground">No orders yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Placed</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <Link href={`/orders/${order.id}`} className="hover:underline">
                          {order.profiles?.full_name ?? order.profiles?.email ?? "—"}
                        </Link>
                      </TableCell>
                      <TableCell>{formatPrice(order.total_amount)}</TableCell>
                      <TableCell>
                        <Badge variant={ORDER_STATUS_VARIANT[order.status]}>{order.status}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatDate(order.created_at)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Users</CardTitle>
          </CardHeader>
          <CardContent>
            {recentUsers.length === 0 ? (
              <p className="text-sm text-muted-foreground">No users yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.full_name ?? "—"}</TableCell>
                      <TableCell className="text-muted-foreground">{user.email ?? "—"}</TableCell>
                      <TableCell>
                        <Badge variant={user.account_status === "active" ? "default" : "destructive"}>
                          {user.account_status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatDate(user.created_at)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
