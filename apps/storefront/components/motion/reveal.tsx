"use client"

import { motion, type Variants } from "framer-motion"
import type { ReactNode } from "react"

const VARIANTS: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
}

// Scroll-triggered fade/rise, used throughout the about-us page and in a
// few homepage sections. `once: true` so a section never re-plays the
// animation on scroll-back-up, and the negative viewport margin starts the
// reveal a little before the section is fully on screen.
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode
  delay?: number
  className?: string
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={VARIANTS}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  )
}
