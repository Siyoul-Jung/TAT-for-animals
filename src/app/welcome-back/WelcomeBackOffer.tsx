import Link from 'next/link'

// Reuses the existing /checkout flow (its PLANS map already carries
// founding_member) — this page's only job is the warm invite + the $10/mo
// rate, not a second payment implementation.
const CHECKOUT_NEXT = '/checkout?plan=founding_member'

export default function WelcomeBackOffer() {
  return (
    <div className="w-full max-w-md text-center">
      <p className="text-[13px] tracking-[0.2em] uppercase font-medium mb-3" style={{ color: '#38601E' }}>
        Welcome back
      </p>
      <h1 className="font-serif text-3xl text-charcoal font-medium mb-4">
        Come see the new home for TAT for Animals.
      </h1>
      <p className="text-charcoal/70 leading-relaxed mb-8">
        As a thank-you for being with us from the start, you can join here at your
        current rate — <span className="font-semibold text-charcoal">$10/month</span>,
        with everything The Calm Circle includes.
      </p>
      <div className="flex flex-col gap-3">
        <Link
          href={`/signup?next=${encodeURIComponent(CHECKOUT_NEXT)}`}
          className="inline-flex items-center justify-center min-h-[52px] px-8 rounded-full font-bold text-[19px] text-cream transition-all hover:opacity-90 active:scale-95"
          style={{ backgroundColor: '#D4703A', boxShadow: '0 6px 20px rgba(212,112,58,0.20)' }}
        >
          Join at $10/month
        </Link>
        <p className="text-sm" style={{ color: '#7A5F4F' }}>
          Already made an account here?{' '}
          <Link
            href={`/login?next=${encodeURIComponent(CHECKOUT_NEXT)}`}
            className="underline underline-offset-2 hover:text-charcoal transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
