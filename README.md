# TAT for Animals — tatforanimals.com

Membership platform for TAT for Animals, built independently from tatlife.com.

## Tech Stack

- **Framework**: Next.js 15 (App Router) + TypeScript
- **Styling**: Tailwind CSS v4
- **CMS**: Sanity (headless) — content managed at `/studio`
- **Auth & Database**: Supabase
- **Payments**: Stripe + PayPal
- **Email**: Resend
- **Hosting**: Vercel

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

Copy `.env.example` to `.env.local` and fill in:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_SITE_URL`
- `RESEND_API_KEY`
- `NEXT_PUBLIC_SANITY_PROJECT_ID`
- `NEXT_PUBLIC_SANITY_DATASET`
- `SANITY_API_TOKEN`

## Sanity Studio

Access the CMS at `/studio` (requires Sanity account with project access).

## Deployment

Deployed on Vercel. Set `COMING_SOON=true` in Vercel environment variables to enable the pre-launch holding page.
