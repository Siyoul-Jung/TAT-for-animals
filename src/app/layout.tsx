import type { Metadata } from "next";
import { Playfair_Display, DM_Sans, DM_Serif_Display } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

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

const dmSerifDisplay = DM_Serif_Display({
  variable: "--font-dm-serif",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "TAT® Calm for Animals (and You) | The Relationship-Driven Way to Heal",
  description: "Experience the calming power of TAT for your animals and yourself. Experience first, simplicity always.",
};

import { Suspense } from "react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${dmSans.variable} ${dmSerifDisplay.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-cream text-charcoal selection:bg-brand/20">
        <Navbar />
        <main className="flex-grow">
          <Suspense fallback={<div className="min-h-screen bg-cream" />}>
            {children}
          </Suspense>
        </main>
      </body>
    </html>
  );
}
