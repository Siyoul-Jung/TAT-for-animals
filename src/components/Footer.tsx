// src/components/Footer.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { BOOKING_URL } from '@/lib/links';

const navLinks = [
  { name: 'About', href: '/about' },
  { name: 'FAQ', href: '/faq' },
  { name: 'Membership', href: '/membership' },
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
  {
    label: 'X',
    href: 'https://x.com/mytapasfleming',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
];

export default function Footer() {
  return (
    <footer
      className="px-6 pt-6 pb-4"
      style={{ backgroundColor: '#2E1A0C' }}
    >
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
            <span className="text-base font-semibold font-serif text-cream/80">
              TAT for Animals<span className="text-green text-[10px] align-super">®</span>
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
                  color: 'rgba(250,246,241,0.55)',
                  border: '1px solid rgba(250,246,241,0.10)',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.color = '#D4A843';
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(212,168,67,0.40)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.color = 'rgba(250,246,241,0.55)';
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(250,246,241,0.10)';
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
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-sm font-light transition-colors"
              style={{ color: 'rgba(250,246,241,0.60)' }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.color = '#D4A843';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.color = 'rgba(250,246,241,0.60)';
              }}
            >
              {link.name}
            </Link>
          ))}
          {/* Quiet booking entry — opens the TATLife (Amelia) session page. Placeholder copy
              pending Tapas's wording. Cream (not green) so it stays AA-legible on the dark footer. */}
          <a
            href={BOOKING_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-light transition-colors"
            style={{ color: 'rgba(250,246,241,0.60)' }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.color = '#D4A843';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.color = 'rgba(250,246,241,0.60)';
            }}
          >
            Book a Session ↗
          </a>
          <a
            href="https://tatlife.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-light transition-colors"
            style={{ color: 'rgba(250,246,241,0.60)' }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.color = '#D4A843';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.color = 'rgba(250,246,241,0.60)';
            }}
          >
            TATLife.com ↗
          </a>
        </div>

        {/* Bottom row — copyright + legal */}
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 pt-2">
          <p
            className="text-xs font-light"
            style={{ color: 'rgba(250,246,241,0.60)' }}
          >
            <span className="sm:hidden">© 2026 TATLife®, Inc.</span>
            <span className="hidden sm:inline">© 2026 TATLife®, Inc. All rights reserved.</span>
          </p>

          <div className="flex items-center gap-4">
            {legalLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-sm font-light transition-colors"
                style={{ color: 'rgba(250,246,241,0.60)' }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.color = 'rgba(250,246,241,0.9)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.color = 'rgba(250,246,241,0.60)';
                }}
              >
                <span className="sm:hidden">{link.short}</span>
                <span className="hidden sm:inline">{link.name}</span>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </footer>
  );
}
