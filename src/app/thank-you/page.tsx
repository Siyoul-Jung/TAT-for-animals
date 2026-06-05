'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';

function ThankYouContent() {
  return (
    <div className="min-h-[calc(100dvh-5rem)] bg-cream flex items-center justify-center px-6 py-24">
      <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg">

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-6 text-center"
        >

          {/* Confirmation badge — check + status as one unit */}
          <div className="flex items-center justify-center gap-2.5">
            <span
              className="flex items-center justify-center w-9 h-9 rounded-full shrink-0"
              style={{ backgroundColor: 'rgba(94,150,53,0.14)' }}
            >
              <Check size={18} strokeWidth={2.5} style={{ color: '#4A7A29' }} />
            </span>
            <p className="text-base font-semibold text-charcoal">
              Payment confirmed
            </p>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl text-charcoal leading-[1.2] text-balance">
            Welcome to TAT&nbsp;for&nbsp;Animals.
          </h1>

          <div>
            <Link
              href="/library"
              className="inline-flex items-center justify-center min-h-[52px] px-8 rounded-full font-semibold text-base text-charcoal transition-all hover:opacity-90 active:scale-95"
              style={{ backgroundColor: '#D4703A', boxShadow: '0 6px 20px rgba(212,112,58,0.20)' }}
            >
              Go to your library →
            </Link>
            <p className="mt-4">
              <Link
                href="/dashboard"
                className="text-sm text-charcoal/65 underline underline-offset-2 hover:text-charcoal transition-colors"
              >
                Visit your dashboard
              </Link>
            </p>
          </div>

        </motion.div>
      </div>
    </div>
  );
}

export default function ThankYouPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cream" />}>
      <ThankYouContent />
    </Suspense>
  );
}
