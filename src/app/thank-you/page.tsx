'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Suspense } from 'react';

function ThankYouContent() {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-6 pt-20 pb-16">
      <div className="max-w-lg w-full">

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-10"
        >

          <div className="space-y-5">
            <p className="text-xs tracking-[0.2em] uppercase font-medium" style={{ color: '#5E9635' }}>
              Welcome to TAT for Animals
            </p>
            <h1 className="font-serif text-4xl md:text-5xl text-charcoal leading-[1.15]">
              Your animal and your<br />healing journey<br />starts here.
            </h1>
            <p className="font-serif italic text-xl md:text-2xl leading-snug text-charcoal/60">
              Take your time. They can feel the difference.
            </p>
            <p className="text-charcoal/55 text-base leading-relaxed pt-1">
              Your library is ready whenever you are.
              A confirmation email is on its way to your inbox.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/library"
              className="inline-flex items-center justify-center min-h-[48px] px-8 rounded-full font-semibold text-base text-cream transition-all hover:opacity-90 active:scale-95"
              style={{ backgroundColor: '#D4703A', boxShadow: '0 6px 20px rgba(212,112,58,0.20)' }}
            >
              Go to your library
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center min-h-[48px] px-8 rounded-full font-semibold text-base transition-all hover:bg-charcoal/5 active:scale-95"
              style={{ border: '1.5px solid rgba(28,16,7,0.15)', color: 'rgba(28,16,7,0.6)' }}
            >
              My Dashboard
            </Link>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 1 }}
            className="font-serif italic text-sm"
            style={{ color: 'rgba(28,16,7,0.5)' }}
          >
            "Help people find peace. One person — and one animal — at a time."
          </motion.p>

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
