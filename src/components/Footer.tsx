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
        <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="#1C1007" />
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
          of the website, it needs to stand out"). Color from Jez, 2026-08-03. */}
      <div className="px-6 pt-8 pb-6" style={{ backgroundColor: '#597e48' }}>
        <div className="max-w-6xl mx-auto">
          <NewsletterSignup />
        </div>
      </div>

      {/* Jez 목업(2026-08-04): 배경을 테라코타(#af4d2c)로 변경 — Bruce의 추가 밴드
          제안 대기 중, 이건 잠정 색상. 배경이 이전(#1E3310, 거의 검정)보다 훨씬
          밝아져서 기존 0.60 불투명도 크림 텍스트/골드 호버로는 AA 4.5:1을 못
          맞춤(계산상 ~2.6–2.8:1) — 흰색 계열로 바꾸고 불투명도를 올려서 맞춤. */}
      <div className="px-6 pt-6 pb-8" style={{ backgroundColor: '#af4d2c' }}>
      <div className="max-w-6xl mx-auto">

        {/* Top row — logo + socials */}
        <div className="flex items-center justify-between pb-3"
          style={{ borderBottom: '1px solid rgba(250,246,241,0.08)' }}
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
            <span className="text-[24px] font-semibold font-serif text-cream/80">
              TAT<span className="text-cream/95 text-sm align-super">®</span> for Animals
            </span>
          </div>

          {/* Social icons */}
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
                  color: 'rgba(255,255,255,0.85)',
                  border: '1px solid rgba(255,255,255,0.25)',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.color = '#FFFFFF';
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.60)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.85)';
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.25)';
                }}
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Nav links */}
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 py-3"
          style={{ borderBottom: '1px solid rgba(250,246,241,0.06)' }}
        >
          {/* 19px — matched to the Subscribe button text (Jez, 2026-07-14) so the
              primary footer menu reads comfortably; legal links below stay 14px. */}
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-[19px] font-light transition-colors py-1.5"
              style={{ color: 'rgba(255,255,255,0.90)' }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.color = '#FFFFFF';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.90)';
              }}
            >
              {link.name}
            </Link>
          ))}
          {/* Quiet booking entry — opens the TATLife (Amelia) session page. Placeholder copy
              pending Tapas's wording. 흰색 0.90 불투명도 — 테라코타 배경에서 AA 확보(0.88은
              4.53:1로 여유 없이 통과, 2026-08-07 감사에서 0.90으로 상향). */}
          <a
            href={BOOKING_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[19px] font-light transition-colors py-1.5"
            style={{ color: 'rgba(255,255,255,0.90)' }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.color = '#FFFFFF';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.90)';
            }}
          >
            Book a session ↗
          </a>
          <a
            href="https://tatlife.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[19px] font-light transition-colors py-1.5"
            style={{ color: 'rgba(255,255,255,0.90)' }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.color = '#FFFFFF';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.90)';
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
              style={{ color: 'rgba(255,255,255,0.90)' }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.color = '#FFFFFF';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.90)';
              }}
            >
              <span className="sm:hidden">{link.short}</span>
              <span className="hidden sm:inline">{link.name}</span>
            </Link>
          ))}
        </div>

        {/* Full copyright + trademark notice (Jez, 2026-06-25). 테라코타 배경(2026-08-04)에서
            AA 확보하려면 흰색 0.90 이상 필요(0.85는 4.34:1로 미달, 2026-08-07 감사에서 발견) —
            계산상 최대 ~5.35:1(순백 100%)이라 여유가 크지 않음, 향후 배경색이 더 바뀌면 재검증 필요. */}
        <p
          className="text-sm font-light leading-relaxed mt-3 max-w-4xl"
          style={{ color: 'rgba(255,255,255,0.90)' }}
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
