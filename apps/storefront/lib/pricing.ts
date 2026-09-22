export type PricingConfig = {
  prepaidDiscountPercent: number
  codFreeShippingThreshold: number
  codAdditionalCharge: number
}

export type OrderTotals = {
  subtotal: number
  discount: number
  additionalCharge: number
  total: number
}

function round2(value: number) {
  return Math.round(value * 100) / 100
}

// Pure — shared between the checkout form (a live preview as the shopper
// picks a payment method) and the order API route (the authoritative
// calculation, re-run server-side rather than trusting whatever the
// client displayed).
export function calculateOrderTotals(
  subtotal: number,
  paymentMethod: "razorpay" | "cod",
  config: PricingConfig
): OrderTotals {
  if (paymentMethod === "razorpay") {
    const discount = round2((subtotal * config.prepaidDiscountPercent) / 100)
    return { subtotal, discount, additionalCharge: 0, total: round2(subtotal - discount) }
  }

  // threshold of 0 means "always charge" — there's no free-shipping tier
  // to compare against, so the below-threshold branch always applies.
  const chargeApplies = config.codFreeShippingThreshold === 0 || subtotal < config.codFreeShippingThreshold
  const additionalCharge = chargeApplies ? config.codAdditionalCharge : 0
  return { subtotal, discount: 0, additionalCharge, total: round2(subtotal + additionalCharge) }
}
