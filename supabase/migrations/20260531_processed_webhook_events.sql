-- Webhook idempotency: prevents duplicate processing when Stripe/PayPal retries
CREATE TABLE IF NOT EXISTS processed_webhook_events (
  id TEXT PRIMARY KEY,
  processed_at TIMESTAMPTZ DEFAULT NOW()
);
