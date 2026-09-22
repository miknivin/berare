import type { Metadata } from "next"
import { getMyReturnRequests, getReturnEligibleOrders } from "@/lib/data/returns"
import { ReturnRequestForm } from "@/components/account/return-request-form"

export const metadata: Metadata = { title: "Returns" }

const RETURN_STATUS_LABEL: Record<string, string> = {
  requested: "Under review",
  accepted: "Accepted",
  rejected: "Not approved",
  completed: "Completed",
}

const RETURN_STATUS_CLASS: Record<string, string> = {
  requested: "bg-muted text-muted-foreground",
  accepted: "bg-primary/10 text-primary",
  rejected: "bg-destructive/10 text-destructive",
  completed: "bg-green-100 text-green-700",
}

export default async function ReturnsPage() {
  const [requests, eligibleOrders] = await Promise.all([getMyReturnRequests(), getReturnEligibleOrders()])

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-heading text-2xl mb-1">Returns</h1>
        <p className="text-sm text-muted-foreground">
          Orders delivered within the last 7 days are eligible for a return.
        </p>
      </div>

      <section>
        <h2 className="text-sm font-medium mb-3">Request a Return</h2>
        <ReturnRequestForm orders={eligibleOrders} />
      </section>

      <section>
        <h2 className="text-sm font-medium mb-3">Your Requests</h2>
        {requests.length === 0 ? (
          <p className="text-sm text-muted-foreground">You haven&apos;t requested any returns yet.</p>
        ) : (
          <ul className="space-y-3">
            {requests.map((request) => (
              <li key={request.id} className="rounded-xl border border-border p-4">
                <div className="flex items-center justify-between gap-3 mb-1">
                  <span className="font-mono text-xs text-muted-foreground">
                    Order #{request.order_id.slice(0, 8)}
                  </span>
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      RETURN_STATUS_CLASS[request.status] ?? "bg-muted text-muted-foreground"
                    }`}
                  >
                    {RETURN_STATUS_LABEL[request.status] ?? request.status}
                  </span>
                </div>
                {request.message && <p className="text-sm text-muted-foreground mb-1">{request.message}</p>}
                {request.status === "rejected" && request.admin_note && (
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">Note: </span>
                    {request.admin_note}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  {new Date(request.created_at).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
