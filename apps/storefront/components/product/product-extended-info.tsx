import { ChevronDown } from "lucide-react"
import { CollapsibleSection } from "./collapsible-section"
import { ProductInfoTabs } from "./product-info-tabs"
import type { ProductFaq } from "@/lib/data/products"

export function ProductExtendedInfo({
  whatItIs,
  whatItDoes,
  howItWorks,
  fullIngredients,
  directionsToUse,
  faqs,
}: {
  whatItIs: string | null
  whatItDoes: string | null
  howItWorks: string | null
  fullIngredients: string | null
  directionsToUse: string | null
  faqs: ProductFaq[]
}) {
  const infoTabs = (
    [
      whatItIs ? { id: "what-it-is", label: "What it is?", content: whatItIs } : null,
      whatItDoes ? { id: "what-it-does", label: "What it does?", content: whatItDoes } : null,
      howItWorks ? { id: "how-it-works", label: "How it does?", content: howItWorks } : null,
    ] as const
  ).filter((t): t is { id: string; label: string; content: string } => t !== null)

  const hasAnything = infoTabs.length > 0 || !!fullIngredients || !!directionsToUse || faqs.length > 0
  if (!hasAnything) return null

  return (
    <div className="space-y-4">
      {infoTabs.length > 0 && (
        <CollapsibleSection title="Product Info" defaultOpen>
          <ProductInfoTabs tabs={infoTabs} />
        </CollapsibleSection>
      )}

      {directionsToUse && (
        <CollapsibleSection title="Directions to Use">
          <p className="whitespace-pre-line">{directionsToUse}</p>
        </CollapsibleSection>
      )}

      {fullIngredients && (
        <CollapsibleSection title="Full Ingredient List">
          <p className="whitespace-pre-line">{fullIngredients}</p>
        </CollapsibleSection>
      )}

      {faqs.length > 0 && (
        <CollapsibleSection title="FAQs">
          <div className="divide-y divide-border">
            {faqs.map((faq, index) => (
              <details key={index} className="group py-3 first:pt-0 last:pb-0">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-2 font-medium text-foreground select-none [&::-webkit-details-marker]:hidden">
                  {faq.question}
                  <ChevronDown
                    className="w-4 h-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
                    aria-hidden="true"
                  />
                </summary>
                <p className="mt-2 whitespace-pre-line">{faq.answer}</p>
              </details>
            ))}
          </div>
        </CollapsibleSection>
      )}
    </div>
  )
}
