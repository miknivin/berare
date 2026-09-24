"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

type InfoTab = { id: string; label: string; content: string }

export function ProductInfoTabs({ tabs }: { tabs: InfoTab[] }) {
  const [activeId, setActiveId] = useState(tabs[0]?.id)
  const activeTab = tabs.find((t) => t.id === activeId) ?? tabs[0]

  if (!activeTab) return null

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveId(tab.id)}
            aria-pressed={tab.id === activeTab.id}
            className={cn(
              "rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
              tab.id === activeTab.id
                ? "border-primary bg-primary/15 text-foreground"
                : "border-border text-muted-foreground hover:bg-muted"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <p className="whitespace-pre-line leading-relaxed">{activeTab.content}</p>
    </div>
  )
}
