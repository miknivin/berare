import type { Metadata } from "next"
import { LegalPage } from "@/components/legal/legal-page"
import { BUSINESS_INFO } from "@/lib/business-info"

export const metadata: Metadata = { title: "Cancellation & Refund Policy" }

export default function ReturnsPolicyPage() {
  return (
    <LegalPage title="Cancellation & Refund Policy" updatedAt="17 August 2026">
      <section>
        <h2>Order Cancellation</h2>
        <p>
          You may cancel an order free of charge as long as it has not yet been shipped. Once an order has
          been dispatched, it cannot be cancelled and must instead be handled under the return process
          below. To cancel, contact us at{" "}
          <a href={`mailto:${BUSINESS_INFO.email}`}>{BUSINESS_INFO.email}</a> or{" "}
          <a href={`tel:${BUSINESS_INFO.phone.replace(/\s/g, "")}`}>{BUSINESS_INFO.phone}</a> with your
          order number.
        </p>
      </section>

      <section>
        <h2>Returns</h2>
        <p>
          Because our products are cosmetics and personal care items, we accept returns only within{" "}
          <strong>7 days of delivery</strong>, and only if the product is unopened, unused, and in its
          original sealed packaging. For hygiene and safety reasons, opened or used products cannot be
          returned.
        </p>
        <p>The following are always eligible for return or replacement, regardless of the above:</p>
        <ul>
          <li>Product received damaged or leaking</li>
          <li>Wrong product or shade delivered</li>
          <li>Product missing from your order</li>
          <li>Item is expired or near expiry on arrival</li>
        </ul>
        <p>
          To request a return, contact us within 7 days of delivery with your order number and photos of
          the product/issue.
        </p>
      </section>

      <section>
        <h2>Refunds</h2>
        <p>
          Once a returned item is received and inspected (or once a cancellation/damaged-item claim is
          approved), refunds are processed as follows:
        </p>
        <ul>
          <li>
            <strong>Razorpay (online payment):</strong> refunded to the original payment method within
            5–7 business days of approval.
          </li>
          <li>
            <strong>Cash on Delivery:</strong> refunded via bank transfer/UPI to an account you provide,
            within 5–7 business days of approval.
          </li>
        </ul>
      </section>

      <section>
        <h2>Non-Returnable Items</h2>
        <p>
          Opened, used, or altered products, and items without their original packaging, are not eligible
          for return except where covered under the damaged/wrong-item/expired cases above.
        </p>
      </section>

      <section>
        <h2>Contact Us</h2>
        <p>
          For cancellations, returns, or refund status, reach us at{" "}
          <a href={`mailto:${BUSINESS_INFO.email}`}>{BUSINESS_INFO.email}</a> or call{" "}
          <a href={`tel:${BUSINESS_INFO.phone.replace(/\s/g, "")}`}>{BUSINESS_INFO.phone}</a>.
        </p>
      </section>
    </LegalPage>
  )
}
