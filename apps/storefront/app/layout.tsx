import { Suspense } from "react";
import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import { QueryProvider } from "@/components/providers/query-provider";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
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
      className={`${inter.variable} ${manrope.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <QueryProvider>
          <AnnouncementBar />
          <Navbar />
          <main className="flex-1 flex flex-col">{children}</main>
          <Suspense fallback={null}>
            <Footer />
          </Suspense>
        </QueryProvider>
      </body>
    </html>
  );
}
