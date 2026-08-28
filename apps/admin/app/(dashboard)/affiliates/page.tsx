import type { Metadata } from "next"
import { requireStaff } from "@/lib/auth"
import { getAffiliateApplications, getAffiliates } from "@/lib/data/affiliates"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ApplicationActions } from "@/components/affiliates/application-actions"
import { AffiliateStatusToggle } from "@/components/affiliates/affiliate-status-toggle"

export const metadata: Metadata = { title: "Affiliates" }

const APPLICATION_STATUS_VARIANT = {
  pending: "secondary",
  approved: "default",
  rejected: "destructive",
} as const

const AFFILIATE_STATUS_VARIANT = {
  active: "default",
  suspended: "destructive",
  deactivated: "secondary",
} as const

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
}

export default async function AffiliatesPage() {
  await requireStaff()
  const [applications, affiliates] = await Promise.all([getAffiliateApplications(), getAffiliates()])

  const pendingCount = applications.filter((a) => a.status === "pending").length

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-xl font-semibold">Affiliates</h1>
        <p className="text-sm text-muted-foreground">
          {affiliates.length} active affiliates &middot; {pendingCount} pending applications
        </p>
      </div>

      <div>
        <h2 className="text-sm font-medium mb-3">Applications</h2>
        {applications.length === 0 ? (
          <p className="text-sm text-muted-foreground">No applications yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Applied</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((application) => (
                <TableRow key={application.id}>
                  <TableCell className="font-medium">{application.full_name}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {application.email}
                    <br />
                    {application.phone}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs max-w-60 truncate">
                    {application.message ?? "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={APPLICATION_STATUS_VARIANT[application.status]}>{application.status}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDate(application.created_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    {application.status === "pending" ? (
                      <ApplicationActions id={application.id} fullName={application.full_name} />
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        {application.status === "rejected" && application.admin_note
                          ? application.admin_note
                          : "—"}
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <div>
        <h2 className="text-sm font-medium mb-3">Active Affiliates</h2>
        {affiliates.length === 0 ? (
          <p className="text-sm text-muted-foreground">No approved affiliates yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Referral Code</TableHead>
                <TableHead>Clicks</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Points Balance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {affiliates.map((affiliate) => (
                <TableRow key={affiliate.id}>
                  <TableCell className="font-medium">
                    {affiliate.profiles?.full_name ?? affiliate.profiles?.email ?? "—"}
                  </TableCell>
                  <TableCell className="font-mono text-xs">{affiliate.referral_code}</TableCell>
                  <TableCell>{affiliate.clicks_count}</TableCell>
                  <TableCell>{affiliate.orders_count}</TableCell>
                  <TableCell>{affiliate.available_points}</TableCell>
                  <TableCell>
                    <Badge variant={AFFILIATE_STATUS_VARIANT[affiliate.status]}>{affiliate.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <AffiliateStatusToggle id={affiliate.id} status={affiliate.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  )
}
