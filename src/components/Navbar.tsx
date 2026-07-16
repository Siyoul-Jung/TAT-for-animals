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

  const AUTH_PATHS = ['/login', '/signup', '/reset-password', '/update-password']
  if (AUTH_PATHS.includes(pathname)) return null;

  const isMember = userRole !== 'guest';
  const navLinkClasses =
    'inline-flex items-center min-h-[44px] text-sm font-medium transition-colors whitespace-nowrap text-charcoal/65 hover:text-green';

  // Current-page nav items are highlighted (green + underline) and non-interactive
  // ("you are here") — emphasis, not dimming, so the active page reads clearly as
  // current rather than disabled, and matches the green "active" cue used elsewhere
  // (library tabs). Green (#467826) on cream clears AA at this size.
  const activeNavClasses =
    'inline-flex items-center min-h-[44px] text-sm font-semibold whitespace-nowrap cursor-default select-none underline underline-offset-[6px] decoration-2 text-green decoration-green';
  const renderNavLink = (href: string, label: string) =>
    pathname === href ? (
      <span aria-current="page" className={activeNavClasses}>{label}</span>
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
            <span className="hidden sm:inline text-base sm:text-2xl font-semibold tracking-normal whitespace-nowrap font-serif text-charcoal/65">
              TAT<span className="text-green text-[11px] sm:text-sm align-super">®</span> for Animals
            </span>
          </Link>
        </div>

        {/* Right — menu. About sits first, same size as the other links (a smaller size
            dropped below the project's 14px floor for secondary text) so it reads as
            part of the same nav cluster rather than an orphaned label next to the
            wordmark (Jez request, 2026-07-01; repositioned after it looked disconnected
            next to the logo). font-medium keeps it visually lighter than the active-page
            underline treatment without going below 14px. */}
        <div className="flex items-center justify-end gap-5 sm:gap-6">
          {pathname === '/about' ? (
            <span aria-current="page" className="inline-flex items-center min-h-[44px] text-sm font-semibold whitespace-nowrap cursor-default select-none underline underline-offset-4 text-green">
              About
            </span>
          ) : (
            <Link href="/about" className={navLinkClasses}>
              About
            </Link>
          )}
          {isLoggedIn ? (
            <>
              {renderNavLink(isMember ? '/library' : '/membership', isMember ? 'Library' : 'Pricing')}
              {renderNavLink('/dashboard', 'Dashboard')}
            </>
          ) : (
            <>
              <Link href="/login" className={navLinkClasses}>
                Sign in
              </Link>
              {renderNavLink('/membership', 'Pricing')}
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
