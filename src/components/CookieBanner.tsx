'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      const id = window.setTimeout(() => setVisible(true), 0);
      return () => window.clearTimeout(id);
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--cookie-banner-offset', visible ? '92px' : '0px');

    return () => {
      root.style.setProperty('--cookie-banner-offset', '0px');
    };
  }, [visible]);

  function accept() {
    localStorage.setItem('cookie_consent', 'accepted');
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 px-5 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))]"
      style={{ backgroundColor: '#FAF6F1', borderTop: '1px solid rgba(28,16,7,0.06)', boxShadow: '0 -6px 24px rgba(28,16,7,0.07)' }}
    >
      <div className="max-w-6xl mx-auto flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <p className="text-sm leading-relaxed" style={{ color: 'rgba(28,16,7,0.7)' }}>
          We use essential cookies to keep your session secure.{' '}
          <Link
            href="/privacy"
            className="underline underline-offset-2 transition-opacity hover:opacity-70"
            style={{ color: 'rgba(28,16,7,0.65)' }}
          >
            Learn more
          </Link>
        </p>
        <button
          onClick={accept}
          className="shrink-0 self-end sm:self-auto min-h-[44px] px-5 py-2 rounded-full text-sm font-semibold transition-all hover:opacity-90 active:scale-95"
          style={{ backgroundColor: '#1C1007', color: '#FBF5F3' }}
        >
          Got it
        </button>
      </div>
    </div>
  );
}
