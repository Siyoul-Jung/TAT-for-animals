import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Navbar from "@/components/Navbar";
import CookieBanner from "@/components/CookieBanner";
import ScrollToTop from "@/components/ScrollToTop";

// JUST Sans Regular — Bruce's pick, one font for headlines and body so the
// site reads as a single voice with the logo (Tapas, 2026-08-16). Replaces
// the previous Playfair Display + DM Sans pairing.
const justSans = localFont({
  src: "./fonts/JustSans-Regular.otf",
  variable: "--font-just-sans",
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://tatforanimals.com"),
  title: "TAT® for Animals | Help Your Animal Feel Calm and at Ease",
  description: "Experience the calming power of TAT for your animals and yourself. Experience first, simplicity always.",
  // PRE-LAUNCH: keep the unfinished site out of Google. REMOVE this line at launch.
  robots: { index: false, follow: false },
  // Social share card (link previews in Messages, Facebook, Slack, …).
  openGraph: {
    type: "website",
    siteName: "TAT for Animals",
    title: "TAT® for Animals | Help Your Animal Feel Calm and at Ease",
    description: "Experience the calming power of TAT for your animals and yourself.",
    images: [{ url: "/images/og.jpg", width: 1200, height: 630, alt: "A cat resting calmly under its person's gentle hand" }],
  },
  twitter: {
    card: "summary_large_image",
  },
};

import { Suspense } from "react";
import { Analytics } from "@vercel/analytics/next";
import Footer from "@/components/Footer";
import MotionProvider from "@/components/MotionProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${justSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-cream text-charcoal selection:bg-brand/20">
        <MotionProvider>
          <Suspense fallback={null}>
            <ScrollToTop />
            <Navbar />
          </Suspense>
          <main className="flex-grow">
            <Suspense fallback={<div className="min-h-screen bg-cream" />}>
              {children}
            </Suspense>
          </main>
          <Footer />
          <CookieBanner />
        </MotionProvider>
        {/* Cookieless page-view analytics (same-origin script, so no CSP or
            cookie-banner implications). Data appears once the Web Analytics
            toggle is on in the Vercel dashboard. */}
        <Analytics />
      </body>
    </html>
  );
}
