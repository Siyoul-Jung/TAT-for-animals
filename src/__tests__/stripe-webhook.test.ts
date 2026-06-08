/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'
import { POST } from '@/app/api/webhooks/stripe/route'

// ── Environment variables ─────────────────────────────────────
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key'
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test'
process.env.STRIPE_PRICE_CALM_LIBRARY = 'price_library'
process.env.STRIPE_PRICE_CALM_CIRCLE = 'price_circle'

// ── Supabase mock — mocks defined inside factory to avoid hoisting issues ──
jest.mock('@supabase/supabase-js', () => {
  const mockEq = jest.fn().mockResolvedValue({ error: null })
  const mockUpdate = jest.fn().mockReturnValue({ eq: mockEq })
  const mockInsert = jest.fn().mockResolvedValue({ error: null })
  const mockDeleteEq = jest.fn().mockResolvedValue({ error: null })
  const mockDelete = jest.fn().mockReturnValue({ eq: mockDeleteEq })
  const mockSingle = jest.fn().mockResolvedValue({ data: null, error: null })
  const mockSelectEq = jest.fn().mockReturnValue({ single: mockSingle })
  const mockSelect = jest.fn().mockReturnValue({ eq: mockSelectEq })
  const mockFrom = jest.fn().mockReturnValue({
    update: mockUpdate,
    insert: mockInsert,
    delete: mockDelete,
    select: mockSelect,
  })
  return {
    createClient: () => ({ from: mockFrom }),
    __mocks: { mockEq, mockUpdate, mockInsert, mockDelete, mockDeleteEq, mockFrom, mockSingle },
  }
})

// ── Stripe mock ───────────────────────────────────────────────
jest.mock('@/lib/stripe', () => ({
  stripe: {
    webhooks: { constructEvent: jest.fn() },
    subscriptions: { retrieve: jest.fn() },
    customers: { retrieve: jest.fn() },
  },
}))

// ── Email mocks ───────────────────────────────────────────────
jest.mock('@/lib/resend', () => ({
  resend: { emails: { send: jest.fn().mockResolvedValue({}) } },
  FROM_EMAIL: 'hello@tatforanimals.com',
}))

jest.mock('@/lib/emails/welcome', () => ({
  welcomeEmail: jest.fn().mockReturnValue({ subject: 'Welcome!', html: '<p>Welcome</p>' }),
}))

jest.mock('@/lib/emails/cancellation', () => ({
  cancellationEmail: jest.fn().mockReturnValue({ subject: 'Cancelled', html: '<p>Bye</p>' }),
}))

// ── Typed references to mocks ─────────────────────────────────
import { stripe } from '@/lib/stripe'
import { resend } from '@/lib/resend'

const { __mocks } = jest.requireMock('@supabase/supabase-js')
const mockFrom: jest.Mock     = __mocks.mockFrom
const mockUpdate: jest.Mock   = __mocks.mockUpdate
const mockEq: jest.Mock       = __mocks.mockEq
const mockInsert: jest.Mock   = __mocks.mockInsert
const mockDelete: jest.Mock   = __mocks.mockDelete
const mockDeleteEq: jest.Mock = __mocks.mockDeleteEq
const mockSingle: jest.Mock   = __mocks.mockSingle

const mockConstructEvent      = stripe.webhooks.constructEvent as jest.Mock
const mockRetrieveSubscription = stripe.subscriptions.retrieve as jest.Mock
const mockRetrieveCustomer    = stripe.customers.retrieve as jest.Mock
const mockSendEmail           = resend.emails.send as jest.Mock

// ── Helpers ───────────────────────────────────────────────────
function makeRequest(body: object, signature = 'valid-sig') {
  return new NextRequest('http://localhost/api/webhooks/stripe', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'stripe-signature': signature },
  })
}

function makeSubscription(overrides = {}) {
  return {
    id: 'sub_123',
    // current_period_end now lives on the subscription item (Stripe basil+)
    items: { data: [{ id: 'si_123', price: { id: 'price_library' }, current_period_end: 1800000000 }] },
    metadata: { supabase_user_id: 'user-123' },
    customer: 'cus_123',
    ...overrides,
  }
}

function makeCheckoutEvent(overrides = {}) {
  return {
    type: 'checkout.session.completed',
    data: {
      object: {
        mode: 'subscription',
        subscription: 'sub_123',
        metadata: { supabase_user_id: 'user-123' },
        customer_details: { email: 'user@test.com', name: 'Test User' },
        ...overrides,
      },
    },
  }
}

beforeEach(() => {
  jest.clearAllMocks()
  // Silence expected console.error calls (e.g. intentional email failures in tests)
  jest.spyOn(console, 'error').mockImplementation(() => {})
})

// ── Tests ─────────────────────────────────────────────────────

describe('Stripe webhook — signature verification', () => {
  it('returns 400 when signature is invalid', async () => {
    mockConstructEvent.mockImplementation(() => { throw new Error('Invalid') })

    const res = await POST(makeRequest({}))
    const data = await res.json()

    expect(res.status).toBe(400)
    expect(data.error).toBe('Invalid signature')
  })

  it('returns 200 with received:true on valid events', async () => {
    mockConstructEvent.mockReturnValue({ type: 'unknown.event', data: { object: {} } })

    const res = await POST(makeRequest({}))
    expect((await res.json()).received).toBe(true)
    expect(res.status).toBe(200)
  })
})

describe('Stripe webhook — checkout.session.completed', () => {
  it('sets role to subscriber for Calm Library price', async () => {
    mockConstructEvent.mockReturnValue(makeCheckoutEvent())
    mockRetrieveSubscription.mockResolvedValue(
      makeSubscription({ items: { data: [{ price: { id: 'price_library' } }] } })
    )

    await POST(makeRequest({}))

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ role: 'subscriber', subscription_status: 'active' })
    )
    expect(mockEq).toHaveBeenCalledWith('id', 'user-123')
  })

  it('sets role to pro_subscriber for Calm Circle price', async () => {
    mockConstructEvent.mockReturnValue(makeCheckoutEvent())
    mockRetrieveSubscription.mockResolvedValue(
      makeSubscription({ items: { data: [{ price: { id: 'price_circle' } }] } })
    )

    await POST(makeRequest({}))

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ role: 'pro_subscriber' })
    )
  })

  it('saves customer name to full_name when provided', async () => {
    mockConstructEvent.mockReturnValue(
      makeCheckoutEvent({ customer_details: { email: 'user@test.com', name: 'Jane Doe' } })
    )
    mockRetrieveSubscription.mockResolvedValue(makeSubscription())

    await POST(makeRequest({}))

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ full_name: 'Jane Doe' })
    )
  })

  it('does NOT update DB when userId is missing', async () => {
    mockConstructEvent.mockReturnValue(makeCheckoutEvent({ metadata: {} }))
    mockRetrieveSubscription.mockResolvedValue(makeSubscription({ metadata: {} }))

    await POST(makeRequest({}))

    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('does NOT update DB when mode is not subscription', async () => {
    mockConstructEvent.mockReturnValue(makeCheckoutEvent({ mode: 'payment' }))

    await POST(makeRequest({}))

    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('sends welcome email after successful activation', async () => {
    mockConstructEvent.mockReturnValue(makeCheckoutEvent())
    mockRetrieveSubscription.mockResolvedValue(makeSubscription())

    await POST(makeRequest({}))

    expect(mockSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'user@test.com' })
    )
  })

  it('still returns 200 even if welcome email fails', async () => {
    mockConstructEvent.mockReturnValue(makeCheckoutEvent())
    mockRetrieveSubscription.mockResolvedValue(makeSubscription())
    mockSendEmail.mockRejectedValueOnce(new Error('Email service down'))

    const res = await POST(makeRequest({}))
    expect(res.status).toBe(200)
  })

  it('falls back to the Customer object when the event omits customer_details (legacy 2016 shape)', async () => {
    mockConstructEvent.mockReturnValue(makeCheckoutEvent({ customer_details: undefined }))
    mockRetrieveSubscription.mockResolvedValue(makeSubscription())
    mockRetrieveCustomer.mockResolvedValue({ deleted: false, email: 'legacy@test.com', name: 'Legacy User' })

    await POST(makeRequest({}))

    expect(mockRetrieveCustomer).toHaveBeenCalledWith('cus_123')
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'legacy@test.com', full_name: 'Legacy User' })
    )
    expect(mockSendEmail).toHaveBeenCalledWith(expect.objectContaining({ to: 'legacy@test.com' }))
  })
})

describe('Stripe webhook — invoice.payment_succeeded', () => {
  // Stripe basil+ delivers the subscription id under parent.subscription_details
  it('updates subscription_status to active on renewal (new payload shape)', async () => {
    mockConstructEvent.mockReturnValue({
      type: 'invoice.payment_succeeded',
      data: { object: { parent: { subscription_details: { subscription: 'sub_123' } } } },
    })
    mockRetrieveSubscription.mockResolvedValue(makeSubscription())

    await POST(makeRequest({}))

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ subscription_status: 'active' })
    )
  })

  // Older in-flight events may still carry the legacy top-level field
  it('still handles the legacy invoice.subscription field', async () => {
    mockConstructEvent.mockReturnValue({
      type: 'invoice.payment_succeeded',
      data: { object: { subscription: 'sub_123' } },
    })
    mockRetrieveSubscription.mockResolvedValue(makeSubscription())

    await POST(makeRequest({}))

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ subscription_status: 'active' })
    )
  })
})

describe('Stripe webhook — invoice.payment_failed', () => {
  it('sets subscription_status to past_due on failed payment (new payload shape)', async () => {
    mockConstructEvent.mockReturnValue({
      type: 'invoice.payment_failed',
      data: { object: { parent: { subscription_details: { subscription: 'sub_123' } } } },
    })
    mockRetrieveSubscription.mockResolvedValue(makeSubscription())

    await POST(makeRequest({}))

    expect(mockUpdate).toHaveBeenCalledWith({ subscription_status: 'past_due' })
    expect(mockEq).toHaveBeenCalledWith('id', 'user-123')
  })
})

describe('Stripe webhook — customer.subscription.updated', () => {
  it('re-fetches the subscription and syncs role on upgrade', async () => {
    // Event arrives in the endpoint's legacy API shape (price lives under
    // `plan`, no item-level period end). The handler must re-fetch, not read it.
    mockConstructEvent.mockReturnValue({
      type: 'customer.subscription.updated',
      data: {
        object: {
          id: 'sub_123',
          metadata: { supabase_user_id: 'user-123' },
          status: 'active',
          items: { data: [{ plan: { id: 'price_circle' } }] },
        },
      },
    })
    // The canonical (re-fetched) subscription carries the modern `price` shape.
    mockRetrieveSubscription.mockResolvedValue(
      makeSubscription({
        items: { data: [{ id: 'si_1', price: { id: 'price_circle' }, current_period_end: 1800000000 }] },
        status: 'active',
      })
    )

    const res = await POST(makeRequest({}))

    expect(res.status).toBe(200)
    expect(mockRetrieveSubscription).toHaveBeenCalledWith('sub_123')
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ role: 'pro_subscriber', subscription_status: 'active' })
    )
  })

  it('ignores events without our metadata (shared account — e.g. tatlife)', async () => {
    mockConstructEvent.mockReturnValue({
      type: 'customer.subscription.updated',
      data: {
        object: {
          id: 'sub_other',
          metadata: {},
          status: 'active',
          items: { data: [{ plan: { id: 'price_woo' } }] },
        },
      },
    })

    const res = await POST(makeRequest({}))

    expect(res.status).toBe(200)
    expect(mockRetrieveSubscription).not.toHaveBeenCalled()
    expect(mockUpdate).not.toHaveBeenCalled()
  })
})

describe('Stripe webhook — customer.subscription.deleted', () => {
  it('resets role to guest and clears subscription data', async () => {
    mockConstructEvent.mockReturnValue({
      type: 'customer.subscription.deleted',
      data: { object: { metadata: { supabase_user_id: 'user-123' }, customer: 'cus_123' } },
    })
    mockRetrieveCustomer.mockResolvedValue({ deleted: false, email: 'user@test.com', name: 'Test User' })

    await POST(makeRequest({}))

    expect(mockUpdate).toHaveBeenCalledWith({
      role: 'guest',
      stripe_subscription_id: null,
      subscription_status: 'inactive',
      current_period_end: null,
    })
    expect(mockEq).toHaveBeenCalledWith('id', 'user-123')
  })

  it('does NOT reset when a different (duplicate) subscription is cancelled', async () => {
    mockConstructEvent.mockReturnValue({
      type: 'customer.subscription.deleted',
      data: { object: { id: 'sub_OLD', metadata: { supabase_user_id: 'user-123' }, customer: 'cus_123' } },
    })
    // Profile still tracks a different, active subscription.
    mockSingle.mockResolvedValueOnce({ data: { stripe_subscription_id: 'sub_CURRENT' }, error: null })

    await POST(makeRequest({}))

    expect(mockUpdate).not.toHaveBeenCalledWith(
      expect.objectContaining({ role: 'guest' })
    )
  })

  it('sends cancellation email after subscription deleted', async () => {
    mockConstructEvent.mockReturnValue({
      type: 'customer.subscription.deleted',
      data: { object: { metadata: { supabase_user_id: 'user-123' }, customer: 'cus_123' } },
    })
    mockRetrieveCustomer.mockResolvedValue({ deleted: false, email: 'user@test.com', name: 'Test User' })

    await POST(makeRequest({}))

    expect(mockSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'user@test.com' })
    )
  })

  it('skips email when customer account is deleted in Stripe', async () => {
    mockConstructEvent.mockReturnValue({
      type: 'customer.subscription.deleted',
      data: { object: { metadata: { supabase_user_id: 'user-123' }, customer: 'cus_123' } },
    })
    mockRetrieveCustomer.mockResolvedValue({ deleted: true })

    await POST(makeRequest({}))

    expect(mockSendEmail).not.toHaveBeenCalled()
  })
})

describe('Stripe webhook — current_period_end', () => {
  it('reads current_period_end from the subscription item, not the subscription object', async () => {
    mockConstructEvent.mockReturnValue(makeCheckoutEvent())
    mockRetrieveSubscription.mockResolvedValue(makeSubscription())

    await POST(makeRequest({}))

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        current_period_end: new Date(1800000000 * 1000).toISOString(),
      })
    )
  })

  it('falls back to null when the item has no period end', async () => {
    mockConstructEvent.mockReturnValue(makeCheckoutEvent())
    mockRetrieveSubscription.mockResolvedValue(
      makeSubscription({ items: { data: [{ price: { id: 'price_library' } }] } })
    )

    await POST(makeRequest({}))

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ current_period_end: null })
    )
  })
})

describe('Stripe webhook — idempotency', () => {
  it('short-circuits when the event was already processed (unique-violation 23505)', async () => {
    mockConstructEvent.mockReturnValue(makeCheckoutEvent())
    mockInsert.mockResolvedValueOnce({ error: { code: '23505' } })

    const res = await POST(makeRequest({}))

    expect((await res.json()).received).toBe(true)
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('rolls back the idempotency marker when the handler throws, so retries can reprocess', async () => {
    mockConstructEvent.mockReturnValue({ id: 'evt_boom', ...makeCheckoutEvent() })
    // Force the handler to throw after the idempotency row was inserted
    mockRetrieveSubscription.mockRejectedValueOnce(new Error('Stripe API down'))

    const res = await POST(makeRequest({}))

    expect(res.status).toBe(500)
    expect(mockDelete).toHaveBeenCalled()
    expect(mockDeleteEq).toHaveBeenCalledWith('id', 'evt_boom')
  })
})
