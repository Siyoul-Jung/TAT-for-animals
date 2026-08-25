'use client';

import { motion } from 'framer-motion';
import { Check, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

function ThankYouContent() {
  // Payment is confirmed, but the subscription webhook (Stripe or PayPal) may
  // take a few seconds to grant the role. Resolve access before sending the
  // member to /library so they're never bounced back to /membership.
  const [ready, setReady] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  // A real arrival here always carries checkout context — Stripe adds ?session_id,
  // PayPal adds ?paypal=1. Without either, someone reached /thank-you directly (a
  // bookmark, or an existing member typing the URL), so we shouldn't show a
  // "payment confirmed" screen they didn't trigger — send them where they belong.
  const hasContext = !!(searchParams.get('session_id') || searchParams.get('paypal'));

  useEffect(() => {
    if (hasContext) return;
    let active = true;
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!active) return;
      if (!user) {
        router.replace('/membership');
        return;
      }
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      if (!active) return;
      const isMember = profile?.role === 'subscriber' || profile?.role === 'pro_subscriber';
      router.replace(isMember ? '/library' : '/membership');
    })();
    return () => {
      active = false;
    };
  }, [hasContext, router]);

  useEffect(() => {
    if (!hasContext) return; // no checkout context — the guard above redirects
    const supabase = createClient();
    let active = true;
    let attempts = 0;
    const maxAttempts = 15; // ~30s at 2s intervals

    // Backstop poll: watch the profile until the webhook flips the role.
    async function poll() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!active) return;
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        if (!active) return;
        if (profile?.role === 'subscriber' || profile?.role === 'pro_subscriber') {
          setReady(true);
          return; // access granted — stop polling
        }
      }
      attempts += 1;
      if (attempts >= maxAttempts) {
        setTimedOut(true);
        return;
      }
      setTimeout(poll, 2000);
    }

    // First, confirm access directly from the payment provider so activation
    // never hinges on webhook timing. On any miss, fall back to polling.
    async function start() {
      try {
        const res = await fetch('/api/checkout/verify', { method: 'POST' });
        if (!active) return;
        const data = await res.json().catch(() => ({}));
        if (data.active) {
          setReady(true);
          return;
        }
      } catch {
        // network/again — fall through to polling
      }
      if (!active) return;
      poll();
    }

    start();
    return () => {
      active = false;
    };
  }, [hasContext]);

  // Direct visit with no checkout context — render nothing while the guard redirects.
  if (!hasContext) return <div className="min-h-[calc(100dvh-5rem)] bg-cream" />;

  return (
    <div className="min-h-[calc(100dvh-5rem)] bg-cream flex items-center justify-center px-6 py-24">
      <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg">

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-6 text-center"
        >

          {/* Confirmation badge — check + status as one unit */}
          <div className="flex items-center justify-center gap-2.5">
            <span
              className="flex items-center justify-center w-9 h-9 rounded-full shrink-0"
              style={{ backgroundColor: 'rgba(70,120,38,0.14)' }}
            >
              <Check size={18} strokeWidth={2.5} style={{ color: '#38601E' }} />
            </span>
            <p className="text-base font-semibold text-charcoal">
              Payment confirmed
            </p>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl text-charcoal leading-[1.2] text-balance">
            Welcome to TAT&nbsp;for&nbsp;Animals.
          </h1>

          <div>
            {ready ? (
              <>
                <Link
                  href="/library"
                  className="inline-flex items-center justify-center min-h-[52px] px-8 rounded-full font-bold text-[19px] text-cream transition-all hover:opacity-90 active:scale-95"
                  style={{ backgroundColor: '#D4703A', boxShadow: '0 6px 20px rgba(212,112,58,0.20)' }}
                >
                  Go to your Video Library →
                </Link>
                <p className="mt-4">
                  <Link
                    href="/dashboard"
                    className="text-sm text-charcoal/65 underline underline-offset-2 hover:text-charcoal transition-colors"
                  >
                    Visit your dashboard
                  </Link>
                </p>
              </>
            ) : timedOut ? (
              <>
                <p className="text-base text-charcoal/65 leading-relaxed">
                  Your access is taking a moment to activate. Head to your dashboard —
                  your Video Library will be ready there shortly.
                </p>
                <p className="mt-4">
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center justify-center min-h-[52px] px-8 rounded-full font-bold text-[19px] text-cream transition-all hover:opacity-90 active:scale-95"
                    style={{ backgroundColor: '#D4703A', boxShadow: '0 6px 20px rgba(212,112,58,0.20)' }}
                  >
                    Visit your dashboard →
                  </Link>
                </p>
              </>
            ) : (
              <p className="flex items-center justify-center gap-2.5 text-base text-charcoal/65">
                <Loader2 size={18} className="animate-spin" style={{ color: '#38601E' }} />
                Setting up your access…
              </p>
            )}
          </div>

        </motion.div>
      </div>
    </div>
  );
}

export default function ThankYouPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cream" />}>
      <ThankYouContent />
    </Suspense>
  );
}
