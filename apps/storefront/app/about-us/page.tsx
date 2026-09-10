import type { Metadata } from "next"
import { AboutContent } from "@/components/about/about-content"

export const metadata: Metadata = {
  title: "About Us",
  description: "Berare — science behind beauty. Beauty with purpose, skincare with intention.",
}

export default function AboutUsPage() {
  return <AboutContent />
}
