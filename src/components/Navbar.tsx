// src/components/Navbar.tsx
'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import LogoMark from '@/components/LogoMark';


export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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


  const navLinks = [
    { name: 'For Animals (and You)', href: '/for-animals' },
    { name: 'For People', href: '/for-people' },
    { name: 'Work with Tapas', href: '/work-with-tapas' },
    { name: 'Find a Pro', href: '/find-a-pro' },
    { name: 'Certification', href: '/certification' },
  ];

  if (pathname === '/session') return null;

  // 다크 배경: 골드 호버 (대비 6.5:1 ✓), 크림 배경: 오렌지 호버 (골드는 크림에서 안보임)
  const textClass = isScrolled
    ? 'text-charcoal/70 hover:text-brand'
    : 'text-cream/70 hover:[color:#D4A843]';
  const activeTextClass = isScrolled ? 'text-brand' : '[color:#D4A843]';

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
            green={isScrolled ? '#6B7A52' : '#9AAD84'}
          />
          <span className={cn(
            'text-xl tracking-wide transition-colors duration-300',
            'font-[family-name:var(--font-dm-serif)]',
            isScrolled ? 'text-charcoal' : 'text-cream'
          )}>
            TATLife<span className="text-brand">®</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-7">
          {navLinks.map((link) => {
            const isComingSoon = link.href === '/find-a-pro' || link.href === '/certification';
            return (
              <Link
                key={link.name}
                href={isComingSoon ? '#' : link.href}
                onClick={(e) => {
                  if (isComingSoon) {
                    e.preventDefault();
                    alert(`${link.name} is coming soon!`);
                  }
                }}
                className={cn(
                  'text-sm font-medium transition-all relative py-1 tracking-wide',
                  pathname === link.href ? activeTextClass : textClass,
                  pathname === link.href && 'after:absolute after:bottom-0 after:left-0 after:right-0 after:h-px after:bg-brand after:rounded-full',
                  isComingSoon && 'opacity-40 hover:opacity-80 cursor-help'
                )}
              >
                {link.name}
              </Link>
            );
          })}
        </div>

        {/* CTA — Join dropdown or My Account */}
        <div className="hidden md:flex items-center">
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
              See Membership
            </Link>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          className={cn(
            'md:hidden transition-colors duration-300',
            isScrolled ? 'text-charcoal' : 'text-cream'
          )}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 bg-cream/98 backdrop-blur-xl shadow-xl p-6 md:hidden flex flex-col gap-4 border-t border-brand/10"
          >
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  'text-lg font-medium py-2 transition-colors border-b border-charcoal/5 last:border-0',
                  pathname === link.href ? 'text-brand font-semibold' : 'text-charcoal/80'
                )}
              >
                {link.name}
              </Link>
            ))}
            <Link
              href="/membership"
              onClick={() => setIsMobileMenuOpen(false)}
              className="mt-2 block text-center px-5 py-3.5 rounded-full bg-brand text-cream font-semibold hover:bg-brand-dark transition-all"
            >
              See Membership Options
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
