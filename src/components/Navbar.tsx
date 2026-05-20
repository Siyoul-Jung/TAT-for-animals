// src/components/Navbar.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useMemo, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';



export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('guest');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const supabase = useMemo(() => createClient(), []);

  // 실제 로그인 상태 감지
  useEffect(() => {
    let active = true;

    async function loadUserProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!active) return;

      setIsLoggedIn(!!user);

      if (!user) {
        setUserRole('guest');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (!active) return;

      setUserRole(profile?.role ?? 'guest');
    }

    loadUserProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      loadUserProfile();
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!dropdownOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);


// 다크 Hero가 있는 페이지 목록 — 상단 섹션이 어두운 배경이라 cream 텍스트가 필요
  if (pathname === '/coming-soon') return null;

  const darkHeroPages: string[] = [];
  const isDarkHero = darkHeroPages.includes(pathname);
  const isMember = userRole !== 'guest';
  const navLinkClasses = cn(
    'text-xs sm:text-sm font-medium transition-colors whitespace-nowrap',
    isScrolled || !isDarkHero ? 'text-charcoal/70 hover:text-brand' : 'text-cream/70 hover:text-cream'
  );

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-40 transition-all duration-500 px-4 sm:px-6 py-3',
        isScrolled
          ? 'bg-cream/95 backdrop-blur-xl shadow-sm'
          : 'bg-cream/95 backdrop-blur-xl'
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">

        {/* Logo */}
        <Link href="/" className="group flex min-w-0 items-center gap-1.5">
          <Image
            src="/images/logo.png"
            alt="TAT for Animals logo"
            width={40}
            height={40}
            className="h-10 w-auto object-contain shrink-0"
            priority
          />
          <span className={cn(
            'hidden sm:inline text-xl tracking-wide transition-colors duration-300 whitespace-nowrap',
            'font-[family-name:var(--font-open-sans)]',
            isScrolled || !isDarkHero ? 'text-charcoal' : 'text-cream'
          )}>
            TAT for Animals<span className="text-brand text-sm align-super">®</span>
          </span>
        </Link>

        {/* CTA — Join or My Account */}
        <div className="flex shrink-0 items-center gap-3">
          {isLoggedIn ? (
            /* 로그인 상태 — My Library 직접 링크 + My Account 드롭다운 */
            <div className="flex items-center gap-3">
              <Link
                href={isMember ? '/library/animals' : '/membership'}
                className={navLinkClasses}
              >
                {isMember ? 'Library' : 'Membership'}
              </Link>

              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen((o) => !o)}
                  className={cn(
                    'flex items-center gap-1.5 text-xs sm:text-sm font-medium transition-all',
                    isScrolled || !isDarkHero
                      ? 'text-charcoal/70 hover:text-brand'
                      : 'text-cream/70 hover:text-cream'
                  )}
                >
                  <span>Account</span>
                  <ChevronDown
                    size={14}
                    className="shrink-0 transition-transform duration-200"
                    style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  />
                </button>

                {dropdownOpen && (
                  <div
                    className="absolute right-0 top-full mt-2 min-w-[140px] rounded-xl overflow-hidden"
                    style={{
                      backgroundColor: '#FAF6F1',
                      border: '1px solid rgba(28,16,7,0.08)',
                      boxShadow: '0 8px 32px rgba(28,16,7,0.10)',
                    }}
                  >
                    <Link
                      href="/dashboard"
                      onClick={() => setDropdownOpen(false)}
                      className="block px-5 py-3 text-sm font-medium transition-colors hover:bg-black/5"
                      style={{ color: 'rgba(28,16,7,0.75)' }}
                    >
                      Dashboard
                    </Link>
                    <div style={{ borderTop: '1px solid rgba(28,16,7,0.06)' }}>
                      <form action="/api/auth/logout" method="POST">
                        <button
                          type="submit"
                          className="block w-full text-left px-5 py-3 text-sm transition-colors hover:bg-black/5"
                          style={{ color: 'rgba(28,16,7,0.40)' }}
                        >
                          Sign out
                        </button>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Join — 직접 멤버십 페이지로 */
            <>
              <Link href="/login" className={navLinkClasses}>
                Sign in
              </Link>
              <Link
                href="/membership"
                className="bg-brand text-cream px-5 sm:px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-brand-dark transition-all hover:shadow-lg hover:shadow-brand/20 active:scale-95"
              >
                Join
              </Link>
            </>
          )}
        </div>

      </div>

      {/* 브랜드 그라디언트 바 — Navbar 하단 */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[8px]"
        style={{
          background: 'linear-gradient(to right, #b0aec8, #e8a0a0, #8fba7a, #e8a890)',
        }}
      />
    </nav>
  );
}
