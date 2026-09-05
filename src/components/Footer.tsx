// src/components/Footer.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { BOOKING_URL } from '@/lib/links';
import NewsletterSignup from '@/components/NewsletterSignup';

const navLinks = [
  { name: 'Pricing', href: '/membership' },
  { name: 'About', href: '/about' },
  { name: 'FAQ', href: '/faq' },
  { name: 'Contact', href: '/contact' },
];

const legalLinks = [
  { name: 'Privacy Policy', short: 'Privacy', href: '/privacy' },
  { name: 'Terms of Service', short: 'Terms', href: '/terms' },
  { name: 'Disclaimer', short: 'Disclaimer', href: '/disclaimer' },
];

// Flip back to true once the social accounts are posting (Jez, 2026-09-05).
const SHOW_SOCIALS = false;

const socials = [
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/tatlifehome/',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  },
  {
    label: 'YouTube',
    href: 'https://www.youtube.com/@TATLifeVideos',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.96-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
        <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="#6DA076" />
      </svg>
    ),
  },
];

export default function Footer() {
  return (
    <footer className="relative">
      {/* 브랜드 그라디언트 바 — Navbar 하단과 동일한 밴드 (Jez, 2026-07-31) */}
      <div
        className="absolute top-0 left-0 right-0 h-[20px]"
        style={{
          background: 'linear-gradient(to right, #b0aec8, #e8a0a0, #8fba7a, #e8a890)',
        }}
      />

      {/* Newsletter invite — its own lighter green band, set apart from the darker
          footer below (Tapas, 2026-08-02: "one of the most important communications
          of the website, it needs to stand out"). Bruce's palette, 2026-09-05:
          #7CC878 light here, #6DA076 below. */}
      <div className="px-6 pt-8 pb-6" style={{ backgroundColor: '#7CC878' }}>
        <div className="max-w-6xl mx-auto">
          <NewsletterSignup />
        </div>
      </div>

      {/* Bruce의 확정 팔레트(2026-09-05): 잠정색이던 테라코타(#af4d2c)를 초록
          #6DA076으로 교체. 초록이 밝아서 흰색 계열 텍스트는 3.03:1로 AA 미달 —
          Jez 지시대로 어두운 글자로 전환했다. charcoal 0.85 = 5.03:1로 통과하며,
          0.75까지 내리면 4.23:1로 떨어지니 이 아래로는 낮추지 말 것. */}
      <div className="px-6 pt-6 pb-8" style={{ backgroundColor: '#6DA076' }}>
      <div className="max-w-6xl mx-auto">

        {/* Top row — logo + socials */}
        <div className="flex items-center justify-between pb-3"
          style={{ borderBottom: '1px solid rgba(28,16,7,0.12)' }}
        >
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Image
              src="/images/logo2.png"
              alt="TAT for Animals logo"
              width={28}
              height={28}
              className="h-7 w-auto object-contain"
              style={{ width: 'auto' }}
            />
            <span className="text-[24px] font-semibold font-serif text-charcoal/65">
              TAT for Animals
            </span>
          </div>

          {/* Social icons — hidden until the accounts have something to show
              (Jez, 2026-09-05: "we don't have any post updates yet"). Kept in
              place rather than deleted; SHOW_SOCIALS goes back to true once the
              accounts are active after launch. */}
          {SHOW_SOCIALS && (
            <div className="flex items-center gap-1.5">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="w-11 h-11 rounded-full flex items-center justify-center transition-all hover:scale-110"
                  style={{
                    color: 'rgba(28,16,7,0.85)',
                    border: '1px solid rgba(28,16,7,0.25)',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.color = '#1C1007';
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(28,16,7,0.60)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.color = 'rgba(28,16,7,0.85)';
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(28,16,7,0.25)';
                  }}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Nav links */}
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 py-3"
          style={{ borderBottom: '1px solid rgba(28,16,7,0.10)' }}
        >
          {/* 19px — matched to the Subscribe button text (Jez, 2026-07-14) so the
              primary footer menu reads comfortably; legal links below stay 14px. */}
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-[19px] font-light transition-colors py-1.5"
              style={{ color: 'rgba(28,16,7,0.85)' }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.color = '#1C1007';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.color = 'rgba(28,16,7,0.85)';
              }}
            >
              {link.name}
            </Link>
          ))}
          {/* Quiet booking entry — opens the TATLife (Amelia) session page. Placeholder copy
              pending Tapas's wording. charcoal 0.85 — 초록 배경(#6DA076)에서 5.03:1. */}
          <a
            href={BOOKING_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[19px] font-light transition-colors py-1.5"
            style={{ color: 'rgba(28,16,7,0.85)' }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.color = '#1C1007';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.color = 'rgba(28,16,7,0.85)';
            }}
          >
            Book a session ↗
          </a>
          <a
            href="https://tatlife.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[19px] font-light transition-colors py-1.5"
            style={{ color: 'rgba(28,16,7,0.85)' }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.color = '#1C1007';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.color = 'rgba(28,16,7,0.85)';
            }}
          >
            TATLife.com ↗
          </a>
        </div>

        {/* Bottom row — legal links */}
        <div className="flex flex-wrap items-center gap-4 pt-2">
          {legalLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-sm font-light transition-colors py-1.5"
              style={{ color: 'rgba(28,16,7,0.85)' }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.color = '#1C1007';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.color = 'rgba(28,16,7,0.85)';
              }}
            >
              <span className="sm:hidden">{link.short}</span>
              <span className="hidden sm:inline">{link.name}</span>
            </Link>
          ))}
        </div>

        {/* Full copyright + trademark notice (Jez, 2026-06-25). 초록 배경(#6DA076,
            2026-09-05)에서는 charcoal 0.85가 5.03:1로 통과한다. 배경색이 또 바뀌면
            여기 불투명도를 다시 계산할 것 — 흰색 계열은 이 배경에서 통과하지 못한다. */}
        <p
          className="text-sm font-light leading-relaxed mt-3 max-w-4xl"
          style={{ color: 'rgba(28,16,7,0.85)' }}
        >
          © 2005–2026 TATLife®, Inc. All rights reserved. No portion of this web site may be
          copied, retransmitted, reposted, duplicated or otherwise used without the express
          written approval of TATLife®, Inc. Tapas Acupressure Technique®, TAT®, and TATLife®
          are registered trademarks of TATLife®, Inc. and may only be used with permission.
        </p>

      </div>
      </div>
    </footer>
  );
}
