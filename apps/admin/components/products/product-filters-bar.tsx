"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Category } from "@/lib/data/categories"

const DEBOUNCE_MS = 300

const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "draft", label: "Draft" },
  { value: "active", label: "Active" },
  { value: "disabled", label: "Disabled" },
]

export function ProductFiltersBar({ categories }: { categories: Category[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(searchParams.get("search") ?? "")
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function updateParams(next: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString())
    for (const [key, value] of Object.entries(next)) {
      if (value == null || value === "" || value === "all") params.delete(key)
      else params.set(key, value)
    }
    // Any filter change invalidates whatever page/pageSize the user was on.
    params.delete("page")
    const query = params.toString()
    router.push(query ? `/products?${query}` : "/products")
  }

  // Debounced so typing doesn't fire a navigation (and a refetch) on every
  // keystroke — only after the user pauses.
  useEffect(() => {
    debounceRef.current = setTimeout(() => {
      if (search === (searchParams.get("search") ?? "")) return
      updateParams({ search: search || null })
    }, DEBOUNCE_MS)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
    // Only re-run when the local input value changes — re-running on every
    // searchParams change would also re-fire right after this effect's own
    // navigation lands.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  const status = searchParams.get("status") ?? "all"
  const categoryId = searchParams.get("category") ?? "all"
  const categoryItems = [
    { value: "all", label: "All categories" },
    ...categories.map((c) => ({ value: c.id, label: c.name })),
  ]

  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-4">
      <Input
        placeholder="Search products…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="sm:max-w-64"
        aria-label="Search products"
      />

      <Select value={status} onValueChange={(v) => v && updateParams({ status: v })} items={STATUS_OPTIONS}>
        <SelectTrigger className="w-full sm:w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={categoryId}
        onValueChange={(v) => v && updateParams({ category: v })}
        items={categoryItems}
      >
        <SelectTrigger className="w-full sm:w-48">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {categoryItems.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
