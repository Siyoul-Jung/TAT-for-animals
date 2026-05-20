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

export const PLAN_IDS: Record<string, string> = {
  calm_library: process.env.PAYPAL_PLAN_CALM_LIBRARY!,
  calm_circle:  process.env.PAYPAL_PLAN_CALM_CIRCLE!,
};

export const PLAN_ROLE_MAP: Record<string, string> = {
  [process.env.PAYPAL_PLAN_CALM_LIBRARY!]: 'subscriber',
  [process.env.PAYPAL_PLAN_CALM_CIRCLE!]:  'pro_subscriber',
};
