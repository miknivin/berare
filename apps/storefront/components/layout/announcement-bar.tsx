import "./announcement-bar.css"
import { getPricingConfig } from "@/lib/data/pricing-config"

// The seamless-loop trick (two copies, translateX 0 -> -50%) only works
// gap-free if a single copy is at least as wide as the viewport — otherwise
// the track runs out of content before the loop resets. Repeating the short
// item list several times per copy keeps it wider than any realistic
// screen, so the wrap is never visible.
const REPEATS_PER_COPY = 5

function AnnouncementList({ announcements, ariaHidden }: { announcements: string[]; ariaHidden?: boolean }) {
  const repeated = Array.from({ length: REPEATS_PER_COPY }, () => announcements).flat()
  return (
    <ul
      className="flex items-center shrink-0"
      aria-hidden={ariaHidden}
    >
      {repeated.map((text, index) => (
        <li key={index} className="flex items-center">
          <span className="px-8 whitespace-nowrap">{text}</span>
          <span aria-hidden="true">•</span>
        </li>
      ))}
    </ul>
  )
}

export async function AnnouncementBar() {
  const pricingConfig = await getPricingConfig()

  const announcements = [
    pricingConfig.prepaidDiscountPercent > 0
      ? `${pricingConfig.prepaidDiscountPercent}% discount on Prepaid orders`
      : null,
    pricingConfig.codFreeShippingThreshold > 0
      ? `Free shipping on order above ₹${pricingConfig.codFreeShippingThreshold}`
      : null,
    "Cash on delivery available",
    "Secure checkout",
  ].filter((text): text is string => text !== null)

  return (
    <div className="bg-primary text-primary-foreground text-xs md:text-sm py-2 overflow-hidden">
      <div className="flex w-max announcement-marquee">
        {/* Rendered twice back to back so the marquee can loop seamlessly —
            see announcement-bar.css for how the -50% translate lines up. */}
        <AnnouncementList announcements={announcements} />
        <AnnouncementList announcements={announcements} ariaHidden />
      </div>
    </div>
  )
}
