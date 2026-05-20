// Run: node scripts/create-paypal-plans.mjs
import { readFileSync } from 'fs';

// Load .env.local manually
const env = Object.fromEntries(
  readFileSync('.env.local', 'utf-8')
    .split('\n')
    .filter(l => l.includes('=') && !l.startsWith('#'))
    .map(l => l.split('=').map(s => s.trim()))
);

const CLIENT_ID = env['NEXT_PUBLIC_PAYPAL_CLIENT_ID'];
const CLIENT_SECRET = env['PAYPAL_CLIENT_SECRET'];
const BASE = 'https://api-m.paypal.com';

async function getAccessToken() {
  const res = await fetch(`${BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  const data = await res.json();
  if (!data.access_token) throw new Error(`Auth failed: ${JSON.stringify(data)}`);
  return data.access_token;
}

async function createProduct(token) {
  const res = await fetch(`${BASE}/v1/catalogs/products`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: 'TAT for Animals Membership',
      type: 'SERVICE',
      category: 'EDUCATIONAL_AND_TEXTBOOKS',
    }),
  });
  const data = await res.json();
  if (!data.id) throw new Error(`Product creation failed: ${JSON.stringify(data)}`);
  console.log(`✓ Product created: ${data.id}`);
  return data.id;
}

async function createPlan(token, productId, name, price) {
  const res = await fetch(`${BASE}/v1/billing/plans`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      product_id: productId,
      name,
      status: 'ACTIVE',
      billing_cycles: [
        {
          frequency: { interval_unit: 'MONTH', interval_count: 1 },
          tenure_type: 'REGULAR',
          sequence: 1,
          total_cycles: 0,
          pricing_scheme: {
            fixed_price: { value: price, currency_code: 'USD' },
          },
        },
      ],
      payment_preferences: {
        auto_bill_outstanding: true,
        setup_fee_failure_action: 'CONTINUE',
        payment_failure_threshold: 3,
      },
    }),
  });
  const data = await res.json();
  if (!data.id) throw new Error(`Plan creation failed: ${JSON.stringify(data)}`);
  console.log(`✓ Plan "${name}": ${data.id}`);
  return data.id;
}

async function main() {
  console.log('Creating PayPal subscription plans...\n');
  const token = await getAccessToken();
  const productId = await createProduct(token);
  const libraryId = await createPlan(token, productId, 'The Calm Library', '27.00');
  const circleId  = await createPlan(token, productId, 'The Calm Circle',  '47.00');

  console.log('\n─── Add these to .env.local ───────────────────');
  console.log(`PAYPAL_PLAN_CALM_LIBRARY=${libraryId}`);
  console.log(`PAYPAL_PLAN_CALM_CIRCLE=${circleId}`);
  console.log('────────────────────────────────────────────────');
}

main().catch(console.error);
