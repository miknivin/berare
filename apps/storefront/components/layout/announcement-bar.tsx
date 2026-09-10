import "./announcement-bar.css"

const ANNOUNCEMENTS = [
  "5% discount on Prepaid orders",
  "Free shipping on order above ₹499",
  "Cash on delivery available",
  "Secure checkout",
]

// The seamless-loop trick (two copies, translateX 0 -> -50%) only works
// gap-free if a single copy is at least as wide as the viewport — otherwise
// the track runs out of content before the loop resets. Repeating the short
// item list several times per copy keeps it wider than any realistic
// screen, so the wrap is never visible.
const REPEATS_PER_COPY = 5
const REPEATED_ANNOUNCEMENTS = Array.from({ length: REPEATS_PER_COPY }, () => ANNOUNCEMENTS).flat()

function AnnouncementList({ ariaHidden }: { ariaHidden?: boolean } = {}) {
  return (
    <ul
      className="flex items-center shrink-0"
      aria-hidden={ariaHidden}
    >
      {REPEATED_ANNOUNCEMENTS.map((text, index) => (
        <li key={index} className="flex items-center">
          <span className="px-8 whitespace-nowrap">{text}</span>
          <span aria-hidden="true">•</span>
        </li>
      ))}
    </ul>
  )
}

export function AnnouncementBar() {
  return (
    <div className="bg-primary text-primary-foreground text-xs md:text-sm py-2 overflow-hidden">
      <div className="flex w-max announcement-marquee">
        {/* Rendered twice back to back so the marquee can loop seamlessly —
            see announcement-bar.css for how the -50% translate lines up. */}
        <AnnouncementList />
        <AnnouncementList ariaHidden />
      </div>
    </div>
  )
}
