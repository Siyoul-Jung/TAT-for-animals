'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';

function ThankYouContent() {
  return (
    <div className="min-h-[60vh] bg-cream flex items-center justify-center px-6 pt-28 pb-20">
      <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg">

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-7"
        >

          {/* Explicit payment confirmation — reassurance before the warm welcome */}
          <div className="flex items-center gap-3">
            <span
              className="flex items-center justify-center w-11 h-11 rounded-full shrink-0"
              style={{ backgroundColor: 'rgba(94,150,53,0.14)' }}
            >
              <Check size={22} strokeWidth={2.5} style={{ color: '#4A7A29' }} />
            </span>
            <p className="text-base font-semibold text-charcoal">
              Payment confirmed — your membership is active.
            </p>
          </div>

          <div className="space-y-4">
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-charcoal leading-[1.2]">
              Your animal and your healing journey starts here.
            </h1>
            <p className="text-charcoal/65 text-base leading-relaxed">
              Your library is ready whenever you are.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/library"
              className="inline-flex items-center justify-center min-h-[52px] px-8 rounded-full font-semibold text-base text-cream transition-all hover:opacity-90 active:scale-95"
              style={{ backgroundColor: '#D4703A', boxShadow: '0 6px 20px rgba(212,112,58,0.20)' }}
            >
              Go to your library
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center min-h-[52px] px-8 rounded-full font-medium text-sm transition-all hover:bg-charcoal/5 active:scale-95"
              style={{ border: '1.5px solid rgba(28,16,7,0.12)', color: 'rgba(28,16,7,0.65)' }}
            >
              My Dashboard
            </Link>
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
