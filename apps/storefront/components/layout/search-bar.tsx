"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Search } from "lucide-react"

export function SearchBar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [value, setValue] = useState(searchParams.get("search") ?? "")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!value.trim()) return
    router.push(`/products?search=${encodeURIComponent(value.trim())}`)
  }

  return (
    <form onSubmit={handleSubmit} className="hidden md:flex items-center">
      <div className="flex items-center gap-2 rounded-full border border-border px-4 py-2 w-56 focus-within:ring-2 focus-within:ring-primary">
        <Search className="w-4 h-4 text-muted-foreground shrink-0" aria-hidden="true" />
        <input
          type="search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search products"
          aria-label="Search products"
          className="flex-1 bg-transparent text-sm outline-none min-w-0"
        />
      </div>
    </form>
  )
}
