import type { Metadata } from "next"
import { requireStaff } from "@/lib/auth"
import { getUsers, type UserRole } from "@/lib/data/users"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { UserRoleQuickSelect } from "@/components/users/user-role-quick-select"
import { UserFilterSheet } from "@/components/users/user-filter-sheet"
import { PaginationNav } from "@/components/shared/pagination-nav"
import { PageSizeSelect } from "@/components/shared/page-size-select"
import { DEFAULT_PAGE_SIZE, parsePageSize } from "@/lib/pagination"

export const metadata: Metadata = { title: "Users" }

const ALL_ROLES: UserRole[] = ["storefront", "affiliate", "admin"]

const ROLE_BADGE: Record<UserRole, { label: string; variant: "default" | "secondary" | "outline" }> = {
  storefront: { label: "Storefront", variant: "outline" },
  affiliate: { label: "Affiliate", variant: "secondary" },
  admin: { label: "Admin", variant: "default" },
}

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string
    pageSize?: string
    roles?: string
    search?: string
    dateFrom?: string
    dateTo?: string
  }>
}) {
  await requireStaff()
  const { page: pageParam, pageSize: pageSizeParam, roles: rolesParam, search, dateFrom, dateTo } =
    await searchParams
  const page = Math.max(1, Number(pageParam) || 1)
  const pageSize = parsePageSize(pageSizeParam)
  const roles = rolesParam
    ? rolesParam.split(",").filter((r): r is UserRole => ALL_ROLES.includes(r as UserRole))
    : undefined

  const { users, total, totalPages } = await getUsers(page, pageSize, { roles, search, dateFrom, dateTo })

  const extraParams: Record<string, string> = {}
  if (rolesParam) extraParams.roles = rolesParam
  if (search) extraParams.search = search
  if (dateFrom) extraParams.dateFrom = dateFrom
  if (dateTo) extraParams.dateTo = dateTo

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold">Users</h1>
        <p className="text-sm text-muted-foreground">{total} users</p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <UserRoleQuickSelect />
        <UserFilterSheet />
      </div>

      <div className="flex justify-end mb-3">
        <PageSizeSelect
          pageSize={pageSize}
          basePath="/users"
          defaultPageSize={DEFAULT_PAGE_SIZE}
          extraParams={extraParams}
        />
      </div>

      {users.length === 0 ? (
        <p className="text-sm text-muted-foreground">No users match these filters.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Roles</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.full_name ?? "—"}</TableCell>
                <TableCell className="text-muted-foreground text-xs">{user.email ?? "—"}</TableCell>
                <TableCell className="text-muted-foreground text-xs">{user.phone ?? "—"}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {user.roles.map((role) => (
                      <Badge key={role} variant={ROLE_BADGE[role].variant}>
                        {ROLE_BADGE[role].label}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={user.account_status === "active" ? "outline" : "destructive"}>
                    {user.account_status}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {new Date(user.created_at).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <PaginationNav
        page={page}
        totalPages={totalPages}
        basePath="/users"
        pageSize={pageSize}
        defaultPageSize={DEFAULT_PAGE_SIZE}
        extraParams={extraParams}
      />
    </div>
  )
}
