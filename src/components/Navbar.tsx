// src/components/Navbar.tsx
'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import LogoMark from '@/components/LogoMark';


export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const pathname = usePathname();
  const supabase = createClient();

  // 실제 로그인 상태 감지
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsLoggedIn(!!user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session?.user);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


// 다크 Hero가 있는 페이지 목록 — 상단 섹션이 어두운 배경이라 cream 텍스트가 필요
  const darkHeroPages = ['/', '/membership'];
  const isDarkHero = darkHeroPages.includes(pathname);
  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500 px-6 py-4',
        isScrolled
          ? 'bg-cream/95 backdrop-blur-xl shadow-sm border-b border-brand/10 py-3'
          : 'bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="group flex items-center gap-2.5">
          <LogoMark
            size={34}
            orange="#D4703A"
            green={isScrolled || !isDarkHero ? '#6B7A52' : '#9AAD84'}
          />
          <span className={cn(
            'text-xl tracking-wide transition-colors duration-300',
            'font-[family-name:var(--font-dm-serif)]',
            isScrolled || !isDarkHero ? 'text-charcoal' : 'text-cream'
          )}>
            TAT for Animals<span className="text-brand">®</span>
          </span>
        </Link>

        {/* CTA — Join or My Account */}
        <div className="flex items-center">
          {isLoggedIn ? (
            /* 로그인 상태 — 대시보드 링크 + 로그아웃 */
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className={cn(
                  'text-sm font-medium transition-colors',
                  isScrolled ? 'text-charcoal/70 hover:text-brand' : 'text-cream/70 hover:text-cream'
                )}
              >
                My Account
              </Link>
              <form action="/api/auth/logout" method="POST">
                <button
                  type="submit"
                  className={cn(
                    'text-sm font-semibold px-4 py-2 rounded-full border transition-all',
                    isScrolled
                      ? 'border-charcoal/20 text-charcoal/70 hover:border-brand hover:text-brand'
                      : 'border-cream/30 text-cream/70 hover:border-cream hover:text-cream'
                  )}
                >
                  Sign out
                </button>
              </form>
            </div>
          ) : (
            /* Join — 직접 멤버십 페이지로 */
            <Link
              href="/membership"
              className="bg-brand text-cream px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-brand-dark transition-all hover:shadow-lg hover:shadow-brand/20 active:scale-95"
            >
              Join
            </Link>
          )}
        </div>

      </div>
    </nav>
  );
}
