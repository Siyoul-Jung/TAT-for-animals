import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import CookieBanner from "@/components/CookieBanner";

const playfair = Playfair_Display({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "TAT for Animals® | Help Your Animal Feel Calm and at Ease",
  description: "Experience the calming power of TAT for your animals and yourself. Experience first, simplicity always.",
  // PRE-LAUNCH: keep the unfinished site out of Google. REMOVE this line at launch.
  robots: { index: false, follow: false },
};

import { Suspense } from "react";
import Footer from "@/components/Footer";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${dmSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-cream text-charcoal selection:bg-brand/20">
        <Suspense fallback={null}>
          <Navbar />
        </Suspense>
        <main className="flex-grow">
          <Suspense fallback={<div className="min-h-screen bg-cream" />}>
            {children}
          </Suspense>
        </main>
        <Footer />
        <CookieBanner />
      </body>
    </html>
  );
}
