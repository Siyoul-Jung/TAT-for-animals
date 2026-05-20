'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Suspense } from 'react';

const PLANS: Record<string, { name: string; price: string }> = {
  calm_library: { name: 'The Calm Library', price: '27' },
  calm_circle:  { name: 'The Calm Circle',  price: '47' },
};

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const plan = searchParams.get('plan') ?? 'calm_library';
  const tier = PLANS[plan] ?? PLANS['calm_library'];
  const [loading, setLoading] = useState<'stripe' | 'paypal' | null>(null);

  async function handlePayment(provider: 'stripe' | 'paypal') {
    setLoading(provider);
    const endpoint = provider === 'paypal' ? '/api/paypal/checkout' : '/api/checkout';
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });

      if (res.status === 401) {
        router.push(`/login?next=/checkout?plan=${plan}`);
        return;
      }

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Something went wrong. Please try again.');
        setLoading(null);
      }
    } catch {
      alert('Something went wrong. Please try again.');
      setLoading(null);
    }
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-6 py-20">
      <div className="w-full max-w-sm">

        {/* Plan summary */}
        <div className="text-center mb-8">
          <p className="text-xs tracking-[0.2em] uppercase font-medium mb-3" style={{ color: '#5E9635' }}>
            You're joining
          </p>
          <h1 className="font-serif text-3xl text-charcoal font-medium mb-2">
            {tier.name}
          </h1>
          <p className="text-charcoal/50">
            <span className="text-2xl font-semibold text-charcoal">${tier.price}</span> / month
          </p>
        </div>

        {/* Payment options */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => handlePayment('stripe')}
            disabled={loading !== null}
            className="w-full py-4 rounded-xl font-semibold text-base transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
            style={{
              backgroundColor: '#D4703A',
              color: '#FAF6F1',
              boxShadow: '0 8px 24px rgba(212,112,58,0.20)',
            }}
          >
            {loading === 'stripe' ? 'Connecting...' : 'Pay with card'}
          </button>

          <button
            onClick={() => handlePayment('paypal')}
            disabled={loading !== null}
            className="w-full py-4 rounded-xl font-semibold text-base transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
            style={{ backgroundColor: '#FFC439', color: '#003087' }}
          >
            {loading === 'paypal' ? 'Connecting...' : 'Pay with PayPal'}
          </button>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: 'rgba(28,16,7,0.35)' }}>
          Cancel anytime · Secure payment
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
