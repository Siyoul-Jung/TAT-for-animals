// src/components/AboutTapas.tsx
'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

const socials = [
  {
    label: 'Facebook',
    href: 'https://facebook.com',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  },
  {
    label: 'YouTube',
    href: 'https://youtube.com',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.96-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
        <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white" />
      </svg>
    ),
  },
  {
    label: 'X',
    href: 'https://x.com',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
];

export default function AboutTapas() {
  return (
    <section className="bg-cream py-20 lg:py-28 px-6 overflow-hidden">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-10 lg:gap-24 items-center">

        {/* Left — Photo */}
        <motion.div
          initial={{ opacity: 0, x: -32 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="relative"
        >
          {/* Decorative amber ring behind photo */}
          <div
            className="absolute -inset-4 rounded-3xl pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse at 30% 70%, rgba(212,112,58,0.12) 0%, transparent 65%)',
            }}
          />

          <div
            className="relative w-full aspect-[4/3] sm:aspect-[3/4] rounded-2xl overflow-hidden"
            style={{
              boxShadow: '0 24px 64px rgba(31,46,20,0.12), 0 0 0 1px rgba(31,46,20,0.06)',
            }}
          >
            <img
              src="/images/tmp_profile.jpg"
              alt="Tapas Fleming — Creator of TAT®"
              className="w-full h-full object-cover object-center"
            />
            {/* Subtle warm overlay */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(to top, rgba(31,46,20,0.25) 0%, transparent 50%)',
              }}
            />
          </div>

          {/* Founded badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="absolute bottom-3 right-3 lg:-bottom-5 lg:-right-5 bg-cream rounded-2xl px-5 py-3 lg:px-6 lg:py-4 flex flex-col gap-0.5"
            style={{
              boxShadow: '0 8px 32px rgba(31,46,20,0.10), 0 0 0 1px rgba(31,46,20,0.07)',
            }}
          >
            <span className="font-serif text-2xl font-semibold text-charcoal">1993</span>
            <span className="text-xs text-charcoal/45 font-light tracking-wide">TAT® Founded</span>
          </motion.div>
        </motion.div>

        {/* Right — Text */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col"
        >
          <p className="text-xs tracking-[0.2em] uppercase font-medium text-brand mb-6">
            The founder
          </p>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-charcoal font-medium leading-tight mb-2">
            Tapas Fleming
          </h2>
          <p className="font-serif italic text-base sm:text-lg text-muted mb-6 lg:mb-10">
            Creator and Founder of TAT®
          </p>

          {/* Divider */}
          <div className="h-px bg-charcoal/8 mb-6 lg:mb-10" />

          <div className="flex flex-col gap-4 lg:gap-6 text-base sm:text-lg text-charcoal/65 font-light leading-relaxed mb-8 lg:mb-12">
            <p>
              After years of searching for a simpler, gentler way to help people heal —
              without reliving their pain — Tapas developed TAT® in 1993.
            </p>
            <p>
              Today, TAT® has reached{' '}
              <span className="text-charcoal/85 font-normal">
                hundreds of thousands of people in over 80 countries.
              </span>{' '}
              Her mission remains the same:
            </p>
            <p className="font-serif italic text-lg sm:text-xl lg:text-2xl text-charcoal/80 leading-snug">
              &ldquo;Help people find peace. One person —<br className="hidden sm:block" />
              and one animal — at a time.&rdquo;
            </p>
          </div>

          {/* CTA */}
          <Link
            href="/about"
            className="inline-flex items-center gap-2 text-sm font-medium tracking-wide transition-opacity duration-200 hover:opacity-70 mb-8"
            style={{ color: 'rgba(212,112,58,0.9)' }}
          >
            Learn more about Tapas →
          </Link>

          {/* Social links */}
          <div className="flex items-center gap-3">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
                style={{
                  color: 'rgba(28,16,7,0.45)',
                  border: '1px solid rgba(28,16,7,0.10)',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.color = '#D4703A';
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(212,112,58,0.35)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.color = 'rgba(28,16,7,0.45)';
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(28,16,7,0.10)';
                }}
              >
                {s.icon}
              </a>
            ))}
          </div>
        </motion.div>

      </div>
    </section>
  );
}
