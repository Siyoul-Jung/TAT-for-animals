'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) setVisible(true);
  }, []);

  function accept() {
    localStorage.setItem('cookie_consent', 'accepted');
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 px-6 py-5"
      style={{ backgroundColor: '#FAF6F1', borderTop: '1px solid rgba(28,16,7,0.08)' }}
    >
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <p className="text-sm leading-relaxed" style={{ color: 'rgba(28,16,7,0.60)' }}>
          We use essential cookies to keep you signed in and your session secure.{' '}
          <Link
            href="/privacy"
            className="underline underline-offset-2 transition-opacity hover:opacity-70"
            style={{ color: 'rgba(28,16,7,0.60)' }}
          >
            Learn more
          </Link>
        </p>
        <button
          onClick={accept}
          className="shrink-0 px-6 py-2.5 rounded-full text-sm font-medium transition-all hover:opacity-90 active:scale-95"
          style={{ backgroundColor: '#D4703A', color: '#FAF6F1' }}
        >
          Got it
        </button>
      </div>
    </div>
  );
}
