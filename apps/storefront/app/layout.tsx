import { Suspense } from "react";
import type { Metadata } from "next";
import { Inter, Manrope, Playfair_Display, Alex_Brush } from "next/font/google";
import { QueryProvider } from "@/components/providers/query-provider";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { CartValidator } from "@/components/cart/cart-validator";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  style: ["italic"],
});

const alexBrush = Alex_Brush({
  variable: "--font-alex-brush",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: {
    default: "Berare",
    template: "%s | Berare",
  },
  description: "Berare — cosmetics, delivered across India.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${manrope.variable} ${playfair.variable} ${alexBrush.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <QueryProvider>
          <CartValidator />
          <AnnouncementBar />
          <Navbar />
          {/* The inner div matters: per the flexbox spec, a flex item
              with auto margins (mx-auto, which every page's root uses to
              center its max-w-7xl container) doesn't stretch to the
              parent's width the way align-items: stretch normally would —
              it sizes itself to its own content's preferred width first
              and centers the leftover space instead. Since every page is
              rendered directly as this flex column's child, that silently
              blew every page's content out to well past 1280px wide,
              forcing horizontal scroll on any viewport narrower than
              that. This wrapper is a plain (non-flex) block, so it
              stretches to 100% correctly, and each page's own mx-auto
              div then centers itself the normal, non-flex way inside it. */}
          <main className="flex-1 flex flex-col min-w-0">
            <div className="min-w-0">{children}</div>
          </main>
          <Suspense fallback={null}>
            <Footer />
          </Suspense>
          <CartDrawer />
        </QueryProvider>
      </body>
    </html>
  );
}
