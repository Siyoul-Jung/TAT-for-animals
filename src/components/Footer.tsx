// src/components/Footer.tsx
'use client';

import Link from 'next/link';
import LogoMark from '@/components/LogoMark';

const navLinks = [
  { name: 'For Your Animal', href: '/for-your-animal' },
  { name: 'Membership', href: '/membership' },
  { name: 'Work with Tapas', href: '/work-with-tapas' },
  { name: 'Find a Pro', href: '/find-a-pro' },
  { name: 'Certification', href: '/certification' },
  { name: 'Contact', href: '/contact' },
];

const legalLinks = [
  { name: 'Privacy Policy', href: '/privacy' },
  { name: 'Terms of Service', href: '/terms' },
];

const socials = [
  {
    label: 'Facebook',
    href: 'https://facebook.com',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  },
  {
    label: 'YouTube',
    href: 'https://youtube.com',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.96-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
        <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="#2B4019" />
      </svg>
    ),
  },
  {
    label: 'X',
    href: 'https://x.com',
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
      className="px-6 pt-20 pb-10"
      style={{ backgroundColor: '#2B4019' }}
    >
      <div className="max-w-6xl mx-auto">

        {/* Top row — logo + tagline + socials */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8 pb-12"
          style={{ borderBottom: '1px solid rgba(250,246,241,0.08)' }}
        >
          {/* Logo + tagline */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2.5">
              <LogoMark size={32} orange="#D4703A" green="#9AAD84" />
              <span className="font-serif text-xl tracking-wide text-cream">
                TAT<span className="text-brand">®</span> CALM
              </span>
            </div>
            <span
              className="text-xs font-light tracking-widest uppercase"
              style={{ color: 'rgba(250,246,241,0.35)' }}
            >
              Sharing the Celebration of Love
            </span>
          </div>

          {/* Social icons */}
          <div className="flex items-center gap-2">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110"
                style={{
                  color: 'rgba(250,246,241,0.40)',
                  border: '1px solid rgba(250,246,241,0.10)',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.color = '#D4703A';
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(212,112,58,0.40)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.color = 'rgba(250,246,241,0.40)';
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(250,246,241,0.10)';
                }}
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Nav links */}
        <div className="flex flex-wrap gap-x-8 gap-y-3 py-10"
          style={{ borderBottom: '1px solid rgba(250,246,241,0.06)' }}
        >
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-sm font-light transition-colors"
              style={{ color: 'rgba(250,246,241,0.45)' }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.color = '#FAF6F1';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.color = 'rgba(250,246,241,0.45)';
              }}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Bottom row — copyright + legal */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-8">
          <p
            className="text-xs font-light"
            style={{ color: 'rgba(250,246,241,0.25)' }}
          >
            © 2026 TATLife®, Inc. All rights reserved.
          </p>

          <div className="flex items-center gap-6">
            {legalLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-xs font-light transition-colors"
                style={{ color: 'rgba(250,246,241,0.25)' }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.color = 'rgba(250,246,241,0.55)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.color = 'rgba(250,246,241,0.25)';
                }}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>

      </div>
    </footer>
  );
}
