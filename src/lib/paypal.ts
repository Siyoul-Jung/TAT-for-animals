const IS_SANDBOX = process.env.PAYPAL_ENV === 'sandbox';
const BASE = IS_SANDBOX ? 'https://api-m.sandbox.paypal.com' : 'https://api-m.paypal.com';

export async function getPayPalAccessToken(): Promise<string> {
  const res = await fetch(`${BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(
        `${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
      ).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
    cache: 'no-store',
  });
  const data = await res.json();
  if (!data.access_token) throw new Error('PayPal auth failed');
  return data.access_token;
}

export async function paypalRequest(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = await getPayPalAccessToken();
  return fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
  });
}

// PayPal ships no SDK types, so these are the hand-written shapes the handlers
// rely on — only the fields actually read are declared. Keeping them here gives
// the webhook and return handler compile-time safety against field-name typos
// and payload-shape drift (the same protection the Stripe SDK gives for free).
export interface PayPalSubscription {
  id?: string
  status?: string
  plan_id?: string
  custom_id?: string
  start_time?: string
  billing_info?: { next_billing_time?: string }
  // Present while APPROVAL_PENDING — lets us send a returning buyer back to the
  // SAME approval page instead of opening a duplicate subscription.
  links?: { rel: string; href: string }[]
}

export interface PayPalWebhookEvent {
  id: string
  event_type: string
  resource: {
    id?: string
    custom_id?: string
    plan_id?: string
    billing_agreement_id?: string
    status?: string
    billing_info?: { next_billing_time?: string }
  }
}

// A bounded fallback "paid-through" date for the rare case where we can't read
// PayPal's next_billing_time and have no stored period end. Used so cancelling a
// member who just paid never strips their access immediately — we grant a full
// interval from now (generous but bounded), erring toward the paying member.
export function estimatePaidThrough(interval: 'month' | 'year'): string {
  const days = interval === 'year' ? 366 : 31
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString()
}

// Retrieve a subscription's current state — used by webhooks to read the
// *authoritative* plan_id and next_billing_time rather than trusting the event
// payload (which can lag or omit fields after a `revise`).
export async function getPayPalSubscription(id: string): Promise<PayPalSubscription> {
  const res = await paypalRequest(`/v1/billing/subscriptions/${id}`, { method: 'GET' })
  if (!res.ok) throw new Error(`PayPal subscription fetch failed: ${res.status}`)
  return res.json()
}

export const PLAN_IDS: Record<string, string> = {
  calm_library:        process.env.PAYPAL_PLAN_CALM_LIBRARY!,
  calm_circle:         process.env.PAYPAL_PLAN_CALM_CIRCLE!,
  calm_library_annual: process.env.PAYPAL_PLAN_CALM_LIBRARY_ANNUAL!,
  calm_circle_annual:  process.env.PAYPAL_PLAN_CALM_CIRCLE_ANNUAL!,
  founding_member:     process.env.PAYPAL_PLAN_FOUNDING_MEMBER!,
};

// Both billing intervals of a tier grant the same role — the role is the tier,
// not the cadence. Annual plans map to the same role as their monthly twin.
export const PLAN_ROLE_MAP: Record<string, string> = {
  [process.env.PAYPAL_PLAN_CALM_LIBRARY!]:        'subscriber',
  [process.env.PAYPAL_PLAN_CALM_CIRCLE!]:         'pro_subscriber',
  [process.env.PAYPAL_PLAN_CALM_LIBRARY_ANNUAL!]: 'subscriber',
  [process.env.PAYPAL_PLAN_CALM_CIRCLE_ANNUAL!]:  'pro_subscriber',
  // Grandfathered $10/mo rate for tatlife subscribers moving over — same
  // access as Calm Circle. Mirrors subscriptionAccess.ts on the Stripe side.
  [process.env.PAYPAL_PLAN_FOUNDING_MEMBER!]:     'pro_subscriber',
};

// PayPal events don't carry the billing cadence, but the plan does. Map the two
// annual plan IDs so the webhook can store the right interval for the dashboard
// label. Anything else (the monthly plans, or an unknown plan) → 'month'.
const ANNUAL_PLAN_IDS = new Set(
  [process.env.PAYPAL_PLAN_CALM_LIBRARY_ANNUAL, process.env.PAYPAL_PLAN_CALM_CIRCLE_ANNUAL].filter(Boolean)
);
export function getPlanInterval(planId: string | undefined): 'month' | 'year' {
  return planId && ANNUAL_PLAN_IDS.has(planId) ? 'year' : 'month';
}
