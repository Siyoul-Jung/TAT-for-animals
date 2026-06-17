// src/components/Navbar.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useMemo, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { membershipHasLapsed } from '@/lib/access';
import { cn } from '@/lib/utils';



export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('guest');
  const lastScrollY = useRef(0);
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
        .select('role, cancel_at')
        .eq('id', user.id)
        .single();

      if (!active) return;

      // Mirror the server's library access rule: a cancelled membership that has
      // passed its paid period lapses to guest, so the nav offers "Membership"
      // instead of a "Library" link that would just bounce to /membership.
      const effectiveRole = membershipHasLapsed(profile?.cancel_at)
        ? 'guest'
        : (profile?.role ?? 'guest');
      setUserRole(effectiveRole);
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
    const handleScroll = () => {
      const y = window.scrollY;
      setIsScrolled(y > 20);
      if (y < 10) {
        setIsVisible(true);
      } else {
        setIsVisible(y < lastScrollY.current);
      }
      lastScrollY.current = y;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

// 다크 Hero가 있는 페이지 목록 — 상단 섹션이 어두운 배경이라 cream 텍스트가 필요
  const AUTH_PATHS = ['/login', '/signup', '/reset-password', '/update-password']
  if (AUTH_PATHS.includes(pathname)) return null;

  const darkHeroPages: string[] = [];
  const isDarkHero = darkHeroPages.includes(pathname);
  const isMember = userRole !== 'guest';
  const navLinkClasses = cn(
    'text-sm font-medium transition-colors whitespace-nowrap',
    isScrolled || !isDarkHero ? 'text-charcoal/65 hover:text-green' : 'text-cream/70 hover:text-cream'
  );

  // Current-page nav items are shown dimmed and non-interactive ("you are here"),
  // so a click that would go nowhere never reads as a broken button. The dim must
  // still clear AA: #7A5F4F on cream ≈ 5.4:1 (charcoal/35 was ~2.3:1 — unreadable;
  // #8B7D72 was ~3.9:1 — borderline for 14px normal, so use the muted token value).
  const mutedNavClasses = cn(
    'text-sm font-medium whitespace-nowrap cursor-default select-none',
    isScrolled || !isDarkHero ? 'text-[#7A5F4F]' : 'text-cream/60'
  );
  const renderNavLink = (href: string, label: string) =>
    pathname === href ? (
      <span aria-current="page" className={mutedNavClasses}>{label}</span>
    ) : (
      <Link href={href} className={navLinkClasses}>{label}</Link>
    );

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-40 transition-all duration-300 px-4 sm:px-6 pt-2 pb-5',
        'bg-cream/95 backdrop-blur-xl'
      )}
      style={{
        transform: isVisible ? 'translateY(0)' : 'translateY(-100%)',
        transition: 'transform 0.3s ease',
        willChange: 'transform',
        WebkitBackdropFilter: 'blur(24px)',
        backdropFilter: 'blur(24px)',
        backgroundColor: 'rgba(250,246,241,0.95)',
      }}
    >
      <div className="flex justify-between items-center">

        {/* Logo + Brand — always left, with the menu grouped on the right */}
        <div className="flex">
          <Link href="/" className="flex items-center gap-0.5">
            <Image
              src="/images/logo2.png"
              alt="TAT for Animals logo"
              width={40}
              height={40}
              className="h-9 sm:h-10 w-auto object-contain shrink-0"
              style={{ width: 'auto' }}
              priority
            />
            <span className={cn(
              'hidden sm:inline text-base sm:text-2xl font-semibold tracking-normal transition-colors duration-300 whitespace-nowrap font-serif',
              isScrolled || !isDarkHero ? 'text-charcoal/65' : 'text-cream'
            )}>
              TAT for Animals<span className="text-green text-[11px] sm:text-sm align-super">®</span>
            </span>
          </Link>
        </div>

        {/* Right — menu */}
        <div className="flex items-center justify-end gap-5 sm:gap-6">
          {isLoggedIn ? (
            <>
              {renderNavLink(isMember ? '/library' : '/membership', isMember ? 'Library' : 'Membership')}
              {renderNavLink('/dashboard', 'Account')}
            </>
          ) : (
            <>
              <Link href="/login" className={navLinkClasses}>
                Sign in
              </Link>
              {renderNavLink('/membership', 'Join')}
            </>
          )}
        </div>

      </div>

      {/* 브랜드 그라디언트 바 — Navbar 상단 */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[20px]"
        style={{
          background: 'linear-gradient(to right, #b0aec8, #e8a0a0, #8fba7a, #e8a890)',
        }}
      />
    </nav>
  );
}
