# TAT for Animals — tatforanimals.com

A production membership platform for [TAT® (Tapas Acupressure Technique)](https://tatlife.com) — built for animal owners who want to help their animals feel calm and at ease.

Two subscription tiers give members access to a private video library (24+ videos) and monthly live webinars with the founder. Content is managed independently by the client through Sanity Studio, with no developer involvement required for day-to-day operations.

**Live site:** tatforanimals.com

---

## Architecture

```
Browser → Next.js (Vercel) → Supabase (Auth + DB)
                           → Sanity  (Content)
                           → Stripe  (Billing)
                           → Vimeo   (Video)
                           → Resend  (Email)
```

### Key design decisions

**Server-side access control, not client-side**
Content access is verified on the server using the user's subscription tier from Supabase. The Vimeo embed URL is never exposed to users who don't have access — there's no "hide this div" approach that can be bypassed in DevTools.

**Webhook-driven subscription state**
Stripe is the source of truth for billing. A webhook handler keeps the Supabase `profiles` table in sync: `checkout.session.completed` activates access, `customer.subscription.deleted` revokes it, and `invoice.payment_failed` marks accounts as past due. This means access changes automatically — no manual intervention needed.

**Service role key scoped to webhook only**
The Supabase service role key (which bypasses Row Level Security) is used only in the Stripe webhook handler, where the request is already verified by Stripe's signature. All other server routes use the anon key with RLS.

**Sanity for content, Supabase for users**
Sanity manages videos and webinar schedules. Supabase manages authentication and subscription state. Both membership tiers can access the full video library (TAT for Animals + Healing ACEs Plus); the monthly live-webinar recordings are gated to The Calm Circle (`pro_subscriber`) and checked server-side at render time.

---

## Tech Stack

| Layer | Choice | Reason |
|-------|--------|--------|
| Framework | Next.js 15 (App Router) | Server components for access control without API round-trips |
| Styling | Tailwind CSS v4 | No config file, `@theme inline` tokens, fast iteration |
| Auth & DB | Supabase | Auth + Postgres in one service, RLS, real-time ready |
| CMS | Sanity | Structured content with a visual editor the client can use independently |
| Payments | Stripe | Subscription management, customer portal, webhook reliability |
| Video | Vimeo | Private hosting with iframe embed, no public URL exposure |
| Email | Resend | Transactional email with React-compatible templates |
| Hosting | Vercel | Zero-config Next.js deployment, edge functions |

---

## Membership Tiers

| Tier | Price | Access |
|------|-------|--------|
| The Calm Library | $27 / month | TAT for Animals video library + Healing ACEs Plus |
| The Calm Circle | $47 / month | Everything above + monthly live webinars + full archive |

---

## Testing

```bash
npm test              # Unit + integration tests (Jest)
npm run test:coverage # Coverage report
npm run test:e2e      # End-to-end tests (Playwright, requires local server)
```

**50 tests across 4 suites — 100% coverage on critical paths:**

| Suite | Tests | What's covered |
|-------|-------|----------------|
| `utils.test.ts` | 9 | `formatDuration`, `getVimeoId` — including boundary cases |
| `LoginClient.test.tsx` | 14 | Password login, magic link, mode toggle, error states, redirect |
| `SignupClient.test.tsx` | 13 | Client-side validation, Supabase errors, success screen |
| `stripe-webhook.test.ts` | 14 | Subscription activation, renewal, payment failure, cancellation |

The Stripe webhook tests verify the full event-to-database flow: correct role assignment per price ID, correct user targeting via `eq('id', userId)`, and that email failures don't affect the webhook response status.

---

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── checkout/          Stripe session creation
│   │   ├── portal/            Stripe customer portal redirect
│   │   └── webhooks/stripe/   Subscription state sync
│   ├── dashboard/             Member account page
│   ├── library/               Video library + webinar archive
│   ├── login/ signup/         Auth pages
│   └── membership/            Pricing + checkout entry
├── components/                Shared UI components
├── lib/
│   ├── supabase/              Client + server Supabase helpers
│   ├── stripe.ts              Stripe instance
│   └── emails/                Resend email templates
└── __tests__/                 Unit + integration tests
```

---

## Getting Started

```bash
npm install
cp .env.example .env.local  # fill in credentials
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key (public) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server only) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `STRIPE_PRICE_CALM_LIBRARY` | Stripe Price ID for $27/mo tier |
| `STRIPE_PRICE_CALM_CIRCLE` | Stripe Price ID for $47/mo tier |
| `RESEND_API_KEY` | Resend API key |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Sanity project ID |
| `NEXT_PUBLIC_SANITY_DATASET` | Sanity dataset (production) |
| `SANITY_API_TOKEN` | Sanity write token (for Studio) |
| `NEXT_PUBLIC_SITE_URL` | Full site URL (for auth callbacks) |

### Sanity Studio

Access the CMS at `/studio`. Requires a Sanity account with project access. Content editors can add videos, webinar recordings, and upcoming session dates without touching code.

---

## Deployment

Hosted on Vercel. Connected to the `main` branch — pushing to `main` triggers a production deploy automatically.
