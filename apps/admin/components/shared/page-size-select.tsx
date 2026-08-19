"use client"

import { useRouter } from "next/navigation"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PAGE_SIZE_OPTIONS } from "@/lib/pagination"

export function PageSizeSelect({
  pageSize,
  basePath,
  defaultPageSize,
}: {
  pageSize: number
  basePath: string
  defaultPageSize: number
}) {
  const router = useRouter()

  function handleChange(value: string | null) {
    if (!value) return
    // Changing the page size invalidates the current page number, and a
    // value matching the default is left off the URL entirely to keep
    // links tidy.
    const params = new URLSearchParams()
    if (Number(value) !== defaultPageSize) params.set("pageSize", value)
    const query = params.toString()
    router.push(query ? `${basePath}?${query}` : basePath)
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Show</span>
      <Select
        value={String(pageSize)}
        onValueChange={handleChange}
        items={PAGE_SIZE_OPTIONS.map((size) => ({ value: String(size), label: String(size) }))}
      >
        <SelectTrigger size="sm" className="w-18">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {PAGE_SIZE_OPTIONS.map((size) => (
            <SelectItem key={size} value={String(size)}>
              {size}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <span className="text-sm text-muted-foreground">per page</span>
    </div>
  )
}
