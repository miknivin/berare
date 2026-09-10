import "./brand-marquee.css"

const BRAND_TAGLINE = "Science-Backed Beauty, For Everyone"

// Repeated several times per copy so a single copy's width comfortably
// exceeds any realistic viewport — otherwise the two-copy loop trick shows
// a visible gap once the track runs out of content (see announcement-bar).
const REPEATS_PER_COPY = 6

function MarqueeList({ ariaHidden }: { ariaHidden?: boolean } = {}) {
  return (
    <ul className="flex items-center shrink-0" aria-hidden={ariaHidden}>
      {Array.from({ length: REPEATS_PER_COPY }).map((_, index) => (
        <li
          key={index}
          className="px-10 whitespace-nowrap font-serif italic text-2xl md:text-4xl text-foreground/80"
        >
          {BRAND_TAGLINE}
        </li>
      ))}
    </ul>
  )
}

export function BrandMarquee() {
  return (
    <div className="border-y border-border bg-muted/40 py-6 md:py-8 overflow-hidden">
      <div className="flex w-max brand-marquee-track">
        {/* Rendered twice back to back so the marquee can loop seamlessly. */}
        <MarqueeList />
        <MarqueeList ariaHidden />
      </div>
    </div>
  )
}
