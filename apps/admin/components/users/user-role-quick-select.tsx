"use client"

import { useState, useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import type { UserRole } from "@/lib/data/users"

const ALL_ROLES: UserRole[] = ["storefront", "affiliate", "admin"]

const ROLE_LABELS: Record<UserRole, string> = {
  storefront: "Storefront Users",
  affiliate: "Affiliates",
  admin: "Admin",
}

function parseRoles(param: string | null): Set<UserRole> {
  if (!param) return new Set(ALL_ROLES)
  const roles = param.split(",").filter((r): r is UserRole => ALL_ROLES.includes(r as UserRole))
  return roles.length > 0 ? new Set(roles) : new Set(ALL_ROLES)
}

export function UserRoleQuickSelect() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  // The chips reflect this optimistic pick the instant it's clicked;
  // searchParams only catches up once the server has actually re-rendered
  // with the new data. Reset during render (React's documented pattern for
  // "adjust state when a prop changes") rather than in an effect, which
  // would apply the old optimistic value for one extra frame first.
  const [optimisticRoles, setOptimisticRoles] = useState<Set<UserRole> | null>(null)
  const [lastSearchParamsKey, setLastSearchParamsKey] = useState(searchParams.toString())
  const searchParamsKey = searchParams.toString()
  if (searchParamsKey !== lastSearchParamsKey) {
    setLastSearchParamsKey(searchParamsKey)
    setOptimisticRoles(null)
  }

  const selected = optimisticRoles ?? parseRoles(searchParams.get("roles"))
  const isAll = selected.size === ALL_ROLES.length

  function apply(next: Set<UserRole>) {
    setOptimisticRoles(next)

    const params = new URLSearchParams(searchParams.toString())
    params.delete("page")
    if (next.size === 0 || next.size === ALL_ROLES.length) {
      params.delete("roles")
    } else {
      params.set("roles", [...next].join(","))
    }
    const query = params.toString()
    startTransition(() => {
      router.push(query ? `/users?${query}` : "/users")
    })
  }

  function toggleRole(role: UserRole) {
    // From "All", clicking a role narrows to just that role rather than
    // deselecting it out of the full set — the latter reads as "everyone
    // except this role," which isn't what a quick-select chip should do.
    // Once narrowed, clicking another role adds to the combination, and
    // clicking an already-selected one removes it (falling back to "All"
    // if that would empty the set).
    if (isAll) {
      apply(new Set([role]))
      return
    }
    const next = new Set(selected)
    if (next.has(role)) next.delete(role)
    else next.add(role)
    apply(next)
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Chip active={isAll} onClick={() => apply(new Set(ALL_ROLES))}>
        All
      </Chip>
      {ALL_ROLES.map((role) => (
        <Chip key={role} active={!isAll && selected.has(role)} onClick={() => toggleRole(role)}>
          {ROLE_LABELS[role]}
        </Chip>
      ))}
      {isPending && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" aria-label="Loading" />}
    </div>
  )
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border text-muted-foreground hover:bg-muted"
      }`}
    >
      {children}
    </button>
  )
}
