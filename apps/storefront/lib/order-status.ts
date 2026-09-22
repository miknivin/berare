export const ORDER_STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  return_requested: "Return under review",
  return_accepted: "Return accepted",
  returned: "Returned",
}

export const ORDER_STATUS_CLASS: Record<string, string> = {
  pending: "bg-muted text-muted-foreground",
  confirmed: "bg-primary/10 text-primary",
  shipped: "bg-primary/10 text-primary",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-destructive/10 text-destructive",
  return_requested: "bg-amber-100 text-amber-700",
  return_accepted: "bg-amber-100 text-amber-700",
  returned: "bg-muted text-muted-foreground",
}
