import { Check } from "lucide-react"

export function ProductHighlights({
  benefits,
  skinTypes,
  keyIngredients,
}: {
  benefits: string[]
  skinTypes: string[]
  keyIngredients: string[]
}) {
  const hasHelpsWith = benefits.length > 0
  const hasWorksBestFor = skinTypes.length > 0
  const hasKeyIngredients = keyIngredients.length > 0

  if (!hasHelpsWith && !hasWorksBestFor && !hasKeyIngredients) return null

  return (
    <div className="mt-6 space-y-5">
      {(hasHelpsWith || hasWorksBestFor) && (
        <div className="rounded-2xl border border-border p-5 space-y-5">
          {hasHelpsWith && (
            <div>
              <h3 className="text-xs font-bold tracking-wide text-foreground uppercase mb-3">Helps With</h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-600 shrink-0" aria-hidden="true" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {hasWorksBestFor && (
            <div>
              <h3 className="text-xs font-bold tracking-wide text-foreground uppercase mb-3">Works Best For</h3>
              <ul className="flex flex-wrap gap-x-5 gap-y-2">
                {skinTypes.map((skinType) => (
                  <li key={skinType} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-600 shrink-0" aria-hidden="true" />
                    {skinType}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {hasKeyIngredients && (
        <div>
          <h3 className="text-xs font-bold tracking-wide text-foreground uppercase mb-3">Key Ingredients</h3>
          <ul className="flex flex-wrap gap-2">
            {keyIngredients.map((ingredient) => (
              <li key={ingredient} className="rounded-lg border border-border bg-muted px-3 py-1.5 text-sm">
                {ingredient}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
