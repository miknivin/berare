"use client"

import { useEffect, useMemo, useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Banknote, CreditCard, Sparkles } from "lucide-react"
import { Country, State } from "country-state-city"
import { useCartStore, useCartSubtotal } from "@/lib/store/cart"
import { formatPrice } from "@/lib/format"
import { loadRazorpayScript } from "@/lib/load-razorpay-script"
import { getProductImageUrl } from "@/lib/image"
import { calculateOrderTotals, type PricingConfig } from "@/lib/pricing"

// Internal-only form state: `countryCode`/state are ISO codes used to look
// up the states list and dial code. Submitted to the API as plain names
// (see handleSubmit) to match the free-text city/pincode fields already
// stored on orders.shipping_address.
type ShippingAddress = {
  fullName: string
  phone: string
  addressLine1: string
  addressLine2: string
  city: string
  countryCode: string
  state: string
  pincode: string
}

type PaymentMethod = "razorpay" | "cod"

const DEFAULT_COUNTRY_CODE = "IN"
const DEFAULT_STATE_NAME = "Kerala"

const EMPTY_ADDRESS: ShippingAddress = {
  fullName: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  countryCode: DEFAULT_COUNTRY_CODE,
  state: DEFAULT_STATE_NAME,
  pincode: "",
}

const ALL_COUNTRIES = Country.getAllCountries()

function dialCodeFor(countryCode: string): string {
  const phonecode = Country.getCountryByCode(countryCode)?.phonecode ?? ""
  return phonecode.startsWith("+") ? phonecode : `+${phonecode}`
}

export function CheckoutForm({
  userEmail,
  pricingConfig,
}: {
  userEmail: string
  pricingConfig: PricingConfig
}) {
  const router = useRouter()
  const items = useCartStore((state) => state.items)
  const clearCart = useCartStore((state) => state.clearCart)
  const subtotal = useCartSubtotal()

  const [address, setAddress] = useState<ShippingAddress>(EMPTY_ADDRESS)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("razorpay")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const states = useMemo(() => State.getStatesOfCountry(address.countryCode), [address.countryCode])
  const dialCode = useMemo(() => dialCodeFor(address.countryCode), [address.countryCode])
  // Client-side preview only — /api/orders recomputes this from scratch
  // server-side and is what actually determines what gets charged.
  const totals = useMemo(
    () => calculateOrderTotals(subtotal, paymentMethod, pricingConfig),
    [subtotal, paymentMethod, pricingConfig]
  )

  useEffect(() => {
    if (items.length === 0) {
      router.replace("/cart")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function updateField(field: keyof ShippingAddress) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setAddress((prev) => ({ ...prev, [field]: e.target.value }))
  }

  function handleCountryChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const countryCode = e.target.value
    const nextStates = State.getStatesOfCountry(countryCode)
    setAddress((prev) => ({
      ...prev,
      countryCode,
      state: countryCode === DEFAULT_COUNTRY_CODE ? DEFAULT_STATE_NAME : (nextStates[0]?.name ?? ""),
    }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
          shippingAddress: {
            fullName: address.fullName,
            phone: `${dialCode}${address.phone}`,
            addressLine1: address.addressLine1,
            addressLine2: address.addressLine2,
            city: address.city,
            state: address.state,
            pincode: address.pincode,
            country: Country.getCountryByCode(address.countryCode)?.name ?? address.countryCode,
          },
          paymentMethod,
        }),
      })

      if (!response.ok) {
        const body = await response.json().catch(() => ({}))
        throw new Error(body.error ?? "Could not place order. Please try again.")
      }

      const order = await response.json()

      if (order.paymentMethod === "cod") {
        clearCart()
        router.push(`/order-confirmation/${order.orderId}`)
        return
      }

      await loadRazorpayScript()

      const razorpay = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "Berare",
        description: "Order payment",
        order_id: order.razorpayOrderId,
        prefill: {
          name: order.prefillName,
          email: order.prefillEmail ?? userEmail,
          contact: order.prefillContact,
        },
        theme: { color: "#8c3b4e" },
        handler: () => {
          clearCart()
          router.push(`/order-confirmation/${order.orderId}`)
        },
        modal: {
          ondismiss: () => setIsSubmitting(false),
        },
      })
      razorpay.open()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.")
      setIsSubmitting(false)
    }
  }

  return (
    <div className="grid md:grid-cols-3 gap-8">
      <form onSubmit={handleSubmit} className="md:col-span-2 space-y-4">
        <h2 className="text-sm font-medium">Shipping Address</h2>

        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Full name" value={address.fullName} onChange={updateField("fullName")} autoComplete="name" />
          <label className="block">
            <span className="block text-xs text-muted-foreground mb-1">Phone</span>
            <div className="flex gap-2">
              <span className="flex items-center justify-center min-h-11 px-3 rounded-lg border border-border bg-muted text-sm text-muted-foreground shrink-0">
                {dialCode}
              </span>
              <input
                type="tel"
                value={address.phone}
                onChange={updateField("phone")}
                required
                autoComplete="tel"
                className="w-full min-h-11 rounded-lg border border-border bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </label>
        </div>

        <label className="block">
          <span className="block text-xs text-muted-foreground mb-1">Country</span>
          <select
            value={address.countryCode}
            onChange={handleCountryChange}
            autoComplete="country"
            className="w-full min-h-11 rounded-lg border border-border bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {ALL_COUNTRIES.map((country) => (
              <option key={country.isoCode} value={country.isoCode}>
                {country.flag} {country.name}
              </option>
            ))}
          </select>
        </label>

        <Field
          label="Address line 1"
          value={address.addressLine1}
          onChange={updateField("addressLine1")}
          autoComplete="address-line1"
        />
        <Field
          label="Address line 2 (optional)"
          value={address.addressLine2}
          onChange={updateField("addressLine2")}
          required={false}
          autoComplete="address-line2"
        />

        <div className="grid sm:grid-cols-3 gap-4">
          <Field label="City" value={address.city} onChange={updateField("city")} autoComplete="address-level2" />
          {states.length > 0 ? (
            <label className="block">
              <span className="block text-xs text-muted-foreground mb-1">State</span>
              <select
                value={address.state}
                onChange={(e) => setAddress((prev) => ({ ...prev, state: e.target.value }))}
                required
                autoComplete="address-level1"
                className="w-full min-h-11 rounded-lg border border-border bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {states.map((state) => (
                  <option key={state.isoCode} value={state.name}>
                    {state.name}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <Field
              label="State"
              value={address.state}
              onChange={updateField("state")}
              autoComplete="address-level1"
            />
          )}
          <Field
            label="Pincode"
            value={address.pincode}
            onChange={updateField("pincode")}
            inputMode="numeric"
            maxLength={6}
            autoComplete="postal-code"
          />
        </div>

        <h2 className="text-sm font-medium pt-2">Payment Method</h2>
        <div className="space-y-2">
          <PaymentOption
            id="payment-razorpay"
            label="Pay Online"
            description="Cards, UPI, netbanking, and wallets via Razorpay"
            icon={<CreditCard className="w-4 h-4" aria-hidden="true" />}
            checked={paymentMethod === "razorpay"}
            onSelect={() => setPaymentMethod("razorpay")}
          />
          <PaymentOption
            id="payment-cod"
            label="Cash on Delivery"
            description="Pay in cash when your order arrives"
            icon={<Banknote className="w-4 h-4" aria-hidden="true" />}
            checked={paymentMethod === "cod"}
            onSelect={() => setPaymentMethod("cod")}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full min-h-12 rounded-full bg-primary text-primary-foreground px-6 py-3 text-sm font-medium hover:bg-primary-hover transition-colors disabled:opacity-50 mt-4"
        >
          {isSubmitting
            ? "Processing…"
            : paymentMethod === "cod"
              ? `Place Order — ${formatPrice(totals.total)}`
              : `Pay ${formatPrice(totals.total)}`}
        </button>

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
      </form>

      <div className="h-fit rounded-xl border border-border p-6">
        <h2 className="text-sm font-medium mb-4">Order Summary</h2>
        <ul className="space-y-3 mb-4">
          {items.map((item) => (
            <li key={item.productId} className="flex items-center gap-3 text-sm">
              <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-muted shrink-0">
                {item.image ? (
                  <Image
                    src={getProductImageUrl(item.image)}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <Sparkles className="w-4 h-4 opacity-40" aria-hidden="true" />
                  </div>
                )}
              </div>
              <span className="text-muted-foreground flex-1 min-w-0">
                {item.name} × {item.quantity}
              </span>
              <span className="shrink-0">{formatPrice(item.price * item.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="border-t border-border pt-4 space-y-1.5">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Subtotal</span>
            <span>{formatPrice(totals.subtotal)}</span>
          </div>
          {totals.discount > 0 && (
            <div className="flex justify-between text-sm text-green-700">
              <span>Prepaid discount</span>
              <span>−{formatPrice(totals.discount)}</span>
            </div>
          )}
          {totals.additionalCharge > 0 && (
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>COD charge</span>
              <span>{formatPrice(totals.additionalCharge)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm font-medium pt-1.5 border-t border-border">
            <span>Total</span>
            <span>{formatPrice(totals.total)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function PaymentOption({
  id,
  label,
  description,
  icon,
  checked,
  onSelect,
}: {
  id: string
  label: string
  description: string
  icon: React.ReactNode
  checked: boolean
  onSelect: () => void
}) {
  return (
    <label
      htmlFor={id}
      className={`flex items-center gap-3 rounded-lg border px-4 py-3 cursor-pointer transition-colors ${
        checked ? "border-primary bg-primary/5" : "border-border hover:bg-muted"
      }`}
    >
      <input
        id={id}
        type="radio"
        name="paymentMethod"
        checked={checked}
        onChange={onSelect}
        className="w-4 h-4 accent-primary shrink-0"
      />
      <span className="shrink-0 text-muted-foreground">{icon}</span>
      <span className="min-w-0">
        <span className="block text-sm font-medium">{label}</span>
        <span className="block text-xs text-muted-foreground">{description}</span>
      </span>
    </label>
  )
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required = true,
  autoComplete,
  inputMode,
  maxLength,
}: {
  label: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  type?: string
  required?: boolean
  autoComplete?: string
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"]
  maxLength?: number
}) {
  return (
    <label className="block">
      <span className="block text-xs text-muted-foreground mb-1">{label}</span>
      <input
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        autoComplete={autoComplete}
        inputMode={inputMode}
        maxLength={maxLength}
        className="w-full min-h-11 rounded-lg border border-border bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      />
    </label>
  )
}
