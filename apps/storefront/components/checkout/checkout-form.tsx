"use client"

import { useEffect, useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { Banknote, CreditCard } from "lucide-react"
import { useCartStore, useCartSubtotal } from "@/lib/store/cart"
import { formatPrice } from "@/lib/format"
import { loadRazorpayScript } from "@/lib/load-razorpay-script"

type ShippingAddress = {
  fullName: string
  phone: string
  addressLine1: string
  addressLine2: string
  city: string
  state: string
  pincode: string
}

type PaymentMethod = "razorpay" | "cod"

const EMPTY_ADDRESS: ShippingAddress = {
  fullName: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  pincode: "",
}

export function CheckoutForm({ userEmail }: { userEmail: string }) {
  const router = useRouter()
  const items = useCartStore((state) => state.items)
  const clearCart = useCartStore((state) => state.clearCart)
  const subtotal = useCartSubtotal()

  const [address, setAddress] = useState<ShippingAddress>(EMPTY_ADDRESS)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("razorpay")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
          shippingAddress: address,
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
          <Field
            label="Phone"
            value={address.phone}
            onChange={updateField("phone")}
            type="tel"
            autoComplete="tel"
          />
        </div>

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
          <Field label="State" value={address.state} onChange={updateField("state")} autoComplete="address-level1" />
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
              ? `Place Order — ${formatPrice(subtotal)}`
              : `Pay ${formatPrice(subtotal)}`}
        </button>

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
      </form>

      <div className="h-fit rounded-xl border border-border p-6">
        <h2 className="text-sm font-medium mb-4">Order Summary</h2>
        <ul className="space-y-2 mb-4">
          {items.map((item) => (
            <li key={item.productId} className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {item.name} × {item.quantity}
              </span>
              <span>{formatPrice(item.price * item.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="border-t border-border pt-4 flex justify-between text-sm font-medium">
          <span>Total</span>
          <span>{formatPrice(subtotal)}</span>
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
