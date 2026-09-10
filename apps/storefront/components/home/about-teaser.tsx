import Image from "next/image"
import Link from "next/link"

// Homepage entry point into the full /about-us story — a short brief plus
// a CTA, not the story itself.
export function AboutTeaser() {
  return (
    <div className="grid md:grid-cols-2 items-center rounded-3xl bg-muted/60 overflow-hidden">
      <div className="relative h-64 md:h-96">
        <Image
          src="/about-us/about-4.webp"
          alt=""
          fill
          className="object-cover"
          loading="lazy"
          sizes="(min-width: 768px) 50vw, 100vw"
        />
      </div>

      <div className="px-6 py-8 md:px-14">
        <p className="text-xs font-medium tracking-widest uppercase text-primary mb-3">About Berare</p>
        <h2 className="font-heading font-bold text-2xl md:text-3xl mb-4 leading-tight">
          Science Behind Beauty
        </h2>
        <p className="text-muted-foreground mb-6 max-w-md leading-relaxed">
          Berare was born from a simple belief — that skincare should work with your everyday life, not
          complicate it. Every product starts with a purpose, not a trend.
        </p>
        <Link
          href="/about-us"
          className="inline-flex items-center min-h-11 rounded-full bg-primary text-primary-foreground px-6 py-3 text-sm font-medium hover:bg-primary-hover transition-colors"
        >
          Our Story
        </Link>
      </div>
    </div>
  )
}
