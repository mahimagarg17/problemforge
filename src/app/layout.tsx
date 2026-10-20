import type { Metadata } from "next";
import { Fraunces, Public_Sans } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";

const display = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const sans = Public_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
  weight: ["400", "500", "600"],
});

const SITE_DESCRIPTION =
  "A public board for everyday problems that don't have a good solution yet. Post the problem and see if someone has a better idea.";

// Same fallback as robots.ts / sitemap.ts. NEXT_PUBLIC_SITE_URL isn't set on
// Vercel yet, and this previously fell back to localhost, which made every
// og:image URL unreachable in production.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://problemforge-gamma.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "ProblemForge",
    template: "%s · ProblemForge",
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: "ProblemForge",
    title: "ProblemForge",
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "ProblemForge",
    description: SITE_DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body className="flex min-h-screen flex-col overflow-x-hidden bg-canvas text-ink antialiased">
        <SiteHeader />
        <main className="min-w-0 flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
