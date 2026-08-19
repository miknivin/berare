/**
 * Cross-app constants for the affiliate attribution mechanism.
 * Imported by storefront, admin, and affiliate — never redefine these values
 * locally in an app, or click/order attribution will silently break.
 */

// Query param a shared affiliate link carries, e.g. /products/lipstick?ref=CODE
export const AFFILIATE_REF_QUERY_PARAM = "ref"

// First-party cookie storing the currently-attributed affiliate link code.
// Set/overwritten by storefront middleware on every visit carrying ?ref=.
export const AFFILIATE_REF_COOKIE_NAME = "berare_ref"

// Long-lived first-party cookie identifying a visitor for click analytics.
export const AFFILIATE_VISITOR_COOKIE_NAME = "berare_vid"

// Column on public.orders that stores the attributed affiliate_links.code
// at the time the order was placed.
export const AFFILIATE_REF_ORDER_COLUMN = "affiliate_ref_code"

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled"

export type ProductStatus = "draft" | "active" | "disabled"

export type AffiliateApplicationStatus = "pending" | "approved" | "rejected"

export type AffiliateStatus = "active" | "suspended" | "deactivated"

export type PointsEntryType = "earned" | "redeemed" | "adjusted" | "reversed"

export type PointsEntryStatus = "pending" | "confirmed" | "reversed"

export type WithdrawalStatus = "requested" | "approved" | "rejected" | "paid"
