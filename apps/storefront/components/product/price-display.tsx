import { formatPrice } from "@/lib/format"

export function PriceDisplay({
  price,
  compareAtPrice,
  size = "sm",
}: {
  price: number
  compareAtPrice: number | null
  size?: "sm" | "lg"
}) {
  const hasDiscount = compareAtPrice != null && compareAtPrice > price
  const percentOff = hasDiscount ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100) : 0

  const priceClass = size === "lg" ? "text-2xl font-medium" : "text-sm font-medium"
  const compareClass = size === "lg" ? "text-lg" : "text-xs"

  return (
    <div className="flex items-baseline gap-2 flex-wrap">
      <span className={priceClass}>{formatPrice(price)}</span>
      {hasDiscount && (
        <>
          <span className={`${compareClass} text-muted-foreground line-through`}>
            {formatPrice(compareAtPrice)}
          </span>
          <span className="text-xs font-medium text-primary">{percentOff}% off</span>
        </>
      )}
    </div>
  )
}
