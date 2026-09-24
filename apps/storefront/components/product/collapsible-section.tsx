import type { ReactNode } from "react"
import { ChevronDown } from "lucide-react"

// Plain <details>/<summary> — no client JS needed for open/close, and it's
// free accessibility (keyboard toggle, screen-reader state) that a custom
// React-state accordion would have to build by hand.
export function CollapsibleSection({
  title,
  defaultOpen = false,
  children,
}: {
  title: string
  defaultOpen?: boolean
  children: ReactNode
}) {
  return (
    <details className="group rounded-xl border border-border overflow-hidden" open={defaultOpen}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 bg-foreground px-4 py-3 text-sm font-bold tracking-wide text-background uppercase select-none [&::-webkit-details-marker]:hidden">
        {title}
        <ChevronDown
          className="w-4 h-4 shrink-0 transition-transform group-open:rotate-180"
          aria-hidden="true"
        />
      </summary>
      <div className="p-4 text-sm text-muted-foreground leading-relaxed">{children}</div>
    </details>
  )
}
