"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { SlidersHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetTrigger,
} from "@/components/ui/sheet"

export function UserFilterSheet() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [open, setOpen] = useState(false)

  const [search, setSearch] = useState(searchParams.get("search") ?? "")
  const [dateFrom, setDateFrom] = useState(searchParams.get("dateFrom") ?? "")
  const [dateTo, setDateTo] = useState(searchParams.get("dateTo") ?? "")

  const activeCount = [searchParams.get("search"), searchParams.get("dateFrom"), searchParams.get("dateTo")].filter(
    Boolean
  ).length

  function handleOpenChange(next: boolean) {
    // Re-sync local drafts with the URL every time the sheet opens, so a
    // Reset-then-reopen (or a quick-select navigation elsewhere) doesn't
    // leave stale values in the fields.
    if (next) {
      setSearch(searchParams.get("search") ?? "")
      setDateFrom(searchParams.get("dateFrom") ?? "")
      setDateTo(searchParams.get("dateTo") ?? "")
    }
    setOpen(next)
  }

  function applyFilters() {
    const params = new URLSearchParams(searchParams.toString())
    params.delete("page")
    if (search) params.set("search", search)
    else params.delete("search")
    if (dateFrom) params.set("dateFrom", dateFrom)
    else params.delete("dateFrom")
    if (dateTo) params.set("dateTo", dateTo)
    else params.delete("dateTo")
    const query = params.toString()
    router.push(query ? `/users?${query}` : "/users")
    setOpen(false)
  }

  function resetFilters() {
    setSearch("")
    setDateFrom("")
    setDateTo("")
    const params = new URLSearchParams(searchParams.toString())
    params.delete("page")
    params.delete("search")
    params.delete("dateFrom")
    params.delete("dateTo")
    const query = params.toString()
    router.push(query ? `/users?${query}` : "/users")
    setOpen(false)
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger
        render={
          <Button variant="outline" className="h-9">
            <SlidersHorizontal className="w-4 h-4" aria-hidden="true" />
            Filters
            {activeCount > 0 && (
              <span className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px]">
                {activeCount}
              </span>
            )}
          </Button>
        }
      />
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Filter Users</SheetTitle>
          <SheetDescription>Narrow the list by when they joined or a name/email keyword.</SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="user-search">Keyword</Label>
            <Input
              id="user-search"
              placeholder="Name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Date added</Label>
            <div className="flex items-center gap-2">
              <Input
                type="date"
                aria-label="Date added from"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
              <span className="text-muted-foreground text-xs">to</span>
              <Input
                type="date"
                aria-label="Date added to"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>
        </div>

        <SheetFooter>
          <Button type="button" onClick={applyFilters}>
            Apply Filters
          </Button>
          <Button type="button" variant="outline" onClick={resetFilters}>
            Reset
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
