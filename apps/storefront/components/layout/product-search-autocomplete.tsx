"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Search, X } from "lucide-react"
import { getProductImageUrl } from "@/lib/image"
import { formatPrice } from "@/lib/format"

type SearchResult = {
  id: string
  name: string
  slug: string
  price: number
  imagePath: string | null
}

const DEBOUNCE_MS = 300

// Self-contained: owns the input, the debounce, the fetch, and the
// dropdown. `onNavigate` just tells the caller to close whatever chrome
// (e.g. the mobile drawer) is wrapping this before routing away.
export function ProductSearchAutocomplete({ onNavigate }: { onNavigate: () => void }) {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  // Guards against an earlier, slower request's response overwriting a
  // later one's results if they resolve out of order.
  const requestIdRef = useRef(0)

  // The effect's only job is scheduling the debounced fetch and reporting
  // its outcome — every setState call it makes happens inside a callback
  // (setTimeout/then/catch/finally), not synchronously in the effect body.
  // The "typing" UI state (isOpen/isLoading flipping true) is a direct
  // response to user input, so that lives in the change handler instead.
  useEffect(() => {
    const trimmed = query.trim()
    if (!trimmed) return

    const requestId = ++requestIdRef.current

    const timeoutId = setTimeout(() => {
      fetch(`/api/products/search?q=${encodeURIComponent(trimmed)}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data: { products?: SearchResult[] } | null) => {
          if (requestId !== requestIdRef.current) return
          setResults(data?.products ?? [])
        })
        .catch(() => {
          if (requestId === requestIdRef.current) setResults([])
        })
        .finally(() => {
          if (requestId === requestIdRef.current) setIsLoading(false)
        })
    }, DEBOUNCE_MS)

    return () => clearTimeout(timeoutId)
  }, [query])

  function handleChange(value: string) {
    setQuery(value)
    if (value.trim()) {
      setIsOpen(true)
      setIsLoading(true)
    } else {
      requestIdRef.current += 1
      setResults([])
      setIsLoading(false)
      setIsOpen(false)
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = query.trim()
    if (!trimmed) return
    setIsOpen(false)
    onNavigate()
    router.push(`/products?search=${encodeURIComponent(trimmed)}`)
  }

  function handleSelect(slug: string) {
    setIsOpen(false)
    onNavigate()
    router.push(`/products/${slug}`)
  }

  function handleClear() {
    setQuery("")
    setResults([])
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <form onSubmit={handleSubmit}>
        <div className="flex items-center gap-2 rounded-full border border-border px-4 py-2.5 focus-within:ring-2 focus-within:ring-primary">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(e) => handleChange(e.target.value)}
            onFocus={() => query.trim() && setIsOpen(true)}
            placeholder="Search products"
            aria-label="Search products"
            className="flex-1 bg-transparent text-sm outline-none min-w-0"
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Clear search"
              className="shrink-0 text-muted-foreground"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </form>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 z-20 rounded-xl border border-border bg-background shadow-lg max-h-80 overflow-y-auto">
          {isLoading ? (
            <p className="px-4 py-3 text-sm text-muted-foreground">Searching…</p>
          ) : results.length > 0 ? (
            <ul>
              {results.map((product) => (
                <li key={product.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(product.slug)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-muted transition-colors"
                  >
                    <span className="relative w-11 h-11 rounded-lg overflow-hidden bg-muted shrink-0">
                      {product.imagePath && (
                        <Image
                          src={getProductImageUrl(product.imagePath)}
                          alt=""
                          fill
                          sizes="44px"
                          className="object-cover"
                        />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium truncate">{product.name}</span>
                      <span className="block text-xs text-muted-foreground">{formatPrice(product.price)}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-4 py-3 text-sm text-muted-foreground">No products found.</p>
          )}
        </div>
      )}
    </div>
  )
}
