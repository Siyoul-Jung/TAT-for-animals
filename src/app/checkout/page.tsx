'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Suspense } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { membershipHasLapsed } from '@/lib/access';

const PLANS: Record<string, { name: string; price: string; interval: 'month' | 'year' }> = {
  calm_library:        { name: 'The Calm Connection', price: '27',  interval: 'month' },
  calm_circle:         { name: 'The Calm Circle',     price: '47',  interval: 'month' },
  calm_library_annual: { name: 'The Calm Connection', price: '270', interval: 'year'  },
  calm_circle_annual:  { name: 'The Calm Circle',     price: '470', interval: 'year'  },
};

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const plan = searchParams.get('plan');
  const tier = plan ? PLANS[plan] : undefined;
  const [loading, setLoading] = useState<'stripe' | 'paypal' | null>(null);
  const [error, setError] = useState<string | null>(null);
  // California's auto-renewal law (§17602) asks for the renewal terms shown
  // clearly before payment AND the buyer's affirmative consent — so the Pay
  // buttons stay disabled until this box is checked.
  const [agreed, setAgreed] = useState(false);
  // Gate the payment form on the visitor's membership status. An already-active
  // subscriber has nothing to buy here — sending them to the form lets them check
  // the box, click Pay, and only then hit the server's "already subscribed" wall:
  // a dead end with the Pay buttons still lit. So we check once on load and, if
  // they already have a subscription, show a friendly "you're already a member"
  // screen instead of the form. 'checking' shows a brief loader so a member never
  // sees the payment form flash.
  const [status, setStatus] = useState<'checking' | 'member' | 'ready'>('checking');

  // An unknown/missing plan would otherwise silently bill the default tier —
  // send them back to choose instead of charging for something they didn't pick.
  useEffect(() => {
    if (!tier) router.replace('/membership');
  }, [tier, router]);

  // Switching plans (e.g. monthly → annual) changes the price and the renewal
  // disclosure shown above, but only the `plan` search param changes — this
  // component stays mounted, so `agreed` would otherwise carry over from the
  // previous plan's terms. California's §17602 consent has to be affirmative
  // for the terms actually on screen, so a plan change must re-ask for it.
  useEffect(() => {
    setAgreed(false);
  }, [plan]);

  useEffect(() => {
    if (!plan || !PLANS[plan]) return; // invalid plan → the effect above redirects
    let activeReq = true;
    (async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        // Not signed in → let the form load; the Pay click handles auth (401 →
        // login with resume), preserving the existing guest-checkout path.
        if (!user) { if (activeReq) setStatus('ready'); return; }
        const { data: profile } = await supabase
          .from('profiles')
          .select('stripe_subscription_id, paypal_subscription_id, cancel_at')
          .eq('id', user.id)
          .single();
        if (!activeReq) return;
        // Same signal the checkout API uses to block a duplicate subscription — but
        // a lapsed membership (cancelled + period ended) doesn't count, so a lapsed
        // PayPal member (whose id is never cleared) can rejoin instead of looping.
        const hasLiveSub =
          !membershipHasLapsed(profile?.cancel_at) &&
          (profile?.stripe_subscription_id || profile?.paypal_subscription_id);
        setStatus(hasLiveSub ? 'member' : 'ready');
      } catch {
        // Never strand the visitor on a loader — fall through to the form; the
        // checkout API still blocks a duplicate subscription server-side.
        if (activeReq) setStatus('ready');
      }
    })();
    return () => { activeReq = false; };
  }, [plan]);

  // Returning via the browser's back button after `window.location.href` sent
  // the visitor to Stripe/PayPal restores this page from bfcache rather than
  // remounting it — so `loading` stays frozen at whatever it was when they
  // left, leaving the Pay button stuck on "Taking you to payment…" forever.
  // `pageshow`'s `persisted` flag is the signal that a bfcache restore (not a
  // fresh load) just happened.
  useEffect(() => {
    function handlePageShow(e: PageTransitionEvent) {
      if (e.persisted) setLoading(null);
    }
    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, []);

  if (!tier || !plan) return <div className="min-h-screen bg-cream" />;

  // Brief loader while we check membership status — keeps a member from ever
  // seeing the payment form before we can redirect them.
  if (status === 'checking') {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-6 py-20">
        <div className="flex flex-col items-center gap-4 text-center">
          <span
            className="h-8 w-8 rounded-full border-2 animate-spin"
            style={{ borderColor: 'rgba(212,112,58,0.25)', borderTopColor: '#D4703A' }}
            aria-hidden="true"
          />
          <p className="text-charcoal/65" role="status">Just a moment…</p>
        </div>
      </div>
    );
  }

  // Already a member — no payment form, just a warm hand-off to their account.
  if (status === 'member') {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-6 py-20">
        <div className="w-full max-w-sm text-center">
          <p className="text-[13px] tracking-[0.2em] uppercase font-medium mb-3" style={{ color: '#467826' }}>
            You're already a member
          </p>
          <h1 className="font-serif text-3xl text-charcoal font-medium mb-4">
            You're all set.
          </h1>
          <p className="text-charcoal/70 leading-relaxed mb-8">
            You already have an active membership, so there's nothing to pay for here.
            To change your plan or manage your membership, head to your dashboard.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center min-h-[52px] px-8 rounded-full font-bold text-[19px] text-cream transition-all hover:opacity-90 active:scale-95"
            style={{ backgroundColor: '#D4703A', boxShadow: '0 6px 20px rgba(212,112,58,0.20)' }}
          >
            Go to your dashboard
          </Link>
        </div>
      </div>
    );
  }

  const isAnnual = tier.interval === 'year';
  // Shown before payment — §17602's required elements (amount, cadence,
  // auto-renewal, cancel/refund policy), one per line. A scannable list, not a
  // paragraph, but never hidden behind a scroll or collapse: the law wants
  // these clear and conspicuous, so every line stays visible.
  const disclosureLines = isAnnual
    ? [
        `$${tier.price} today, then once a year`,
        `Renews automatically until you cancel — we email a reminder first`,
        `Full refund within 14 days of purchase — after that, access continues through your paid year`,
      ]
    : [
        `$${tier.price} per month — renews automatically until you cancel`,
        `Cancel anytime — access continues through your paid month`,
      ];
  const consentLabel = isAnnual
    ? 'I understand my annual membership renews automatically each year until I cancel, and that refunds are available only within 14 days of purchase.'
    : 'I understand my membership renews automatically each month until I cancel.';

  async function handlePayment(provider: 'stripe' | 'paypal') {
    setLoading(provider);
    setError(null);
    const endpoint = provider === 'paypal' ? '/api/paypal/checkout' : '/api/checkout';
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });

      if (res.status === 401) {
        // Session lapsed mid-checkout. Flag it so the login screen explains the
        // sudden redirect ("sign in again to finish your payment") instead of
        // dropping the user on a silent form mid-purchase.
        router.push(
          `/login?notice=resume_checkout&next=${encodeURIComponent(`/checkout?plan=${plan}`)}`
        );
        return;
      }

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || "We couldn't start your checkout. Please try again in a moment.");
        setLoading(null);
      }
    } catch {
      setError("We couldn't reach our payment system. Please check your connection and try again.");
      setLoading(null);
    }
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-6 py-20">
      <div className="w-full max-w-sm">

        {/* Plan summary */}
        <div className="text-center mb-8">
          <p className="text-[13px] tracking-[0.2em] uppercase font-medium mb-3" style={{ color: '#467826' }}>
            You're joining
          </p>
          <h1 className="font-serif text-3xl text-charcoal font-medium mb-2">
            {tier.name}
          </h1>
          <p className="text-charcoal/65">
            <span className="text-2xl font-semibold text-charcoal">${tier.price}</span> / {tier.interval === 'year' ? 'year' : 'month'}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div role="alert" className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-4">
            <p className="text-sm text-red-700 leading-relaxed">{error}</p>
            {error.includes('already have an active subscription') && (
              <Link
                href="/dashboard"
                className="inline-flex items-center min-h-[44px] mt-1 text-sm font-medium text-red-700 underline underline-offset-2 hover:no-underline"
              >
                Go to your dashboard →
              </Link>
            )}
          </div>
        )}

        {/* Billing terms — shown clearly before payment */}
        <div className="rounded-xl px-4 py-3.5 mb-4 border" style={{ backgroundColor: 'rgba(70,120,38,0.05)', borderColor: 'rgba(70,120,38,0.18)' }}>
          <ul className="space-y-1.5">
            {disclosureLines.map((line) => (
              <li key={line} className="flex gap-2.5 text-sm leading-relaxed" style={{ color: '#3F3128' }}>
                <span aria-hidden className="font-bold" style={{ color: '#467826' }}>·</span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Affirmative consent — required before the Pay buttons enable */}
        <label className="flex items-start gap-3 mb-5 cursor-pointer">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-0.5 h-6 w-6 shrink-0"
            style={{ accentColor: '#467826' }}
          />
          <span className="text-sm leading-relaxed" style={{ color: '#3F3128' }}>
            {consentLabel}
          </span>
        </label>

        {/* Payment options */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => handlePayment('stripe')}
            disabled={loading !== null || !agreed}
            className="w-full py-4 rounded-xl font-bold text-[19px] transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: '#D4703A',
              color: '#FAF6F1',
              boxShadow: '0 8px 24px rgba(212,112,58,0.20)',
            }}
          >
            {loading === 'stripe' ? 'Taking you to payment…' : 'Pay with card'}
          </button>

          <button
            onClick={() => handlePayment('paypal')}
            disabled={loading !== null || !agreed}
            className="w-full py-4 rounded-xl font-bold text-[19px] transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#FFC439', color: '#003087' }}
          >
            {loading === 'paypal' ? 'Taking you to payment…' : 'Pay with PayPal'}
          </button>
        </div>

        {!agreed && (
          <p className="text-center text-sm mt-4" style={{ color: '#7A5F4F' }}>
            Please check the box above to continue.
          </p>
        )}

        <p className="text-center text-sm mt-6" style={{ color: '#7A5F4F' }}>
          Cancel anytime · Secure payment ·{' '}
          <Link href="/terms" className="underline underline-offset-2 hover:text-charcoal transition-colors">Terms</Link>
          {' '}·{' '}
          <Link href="/privacy" className="underline underline-offset-2 hover:text-charcoal transition-colors">Privacy</Link>
        </p>

      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cream" />}>
      <CheckoutContent />
    </Suspense>
  );
}
