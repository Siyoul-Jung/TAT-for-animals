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
  const mockFrom = jest.fn().mockReturnValue({ update: mockUpdate })
  return {
    createClient: () => ({ from: mockFrom }),
    __mocks: { mockEq, mockUpdate, mockFrom },
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
const mockFrom: jest.Mock   = __mocks.mockFrom
const mockUpdate: jest.Mock = __mocks.mockUpdate
const mockEq: jest.Mock     = __mocks.mockEq

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
    items: { data: [{ price: { id: 'price_library' } }] },
    metadata: { supabase_user_id: 'user-123' },
    current_period_end: 1800000000,
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
})

describe('Stripe webhook — invoice.payment_succeeded', () => {
  it('updates subscription_status to active on renewal', async () => {
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
  it('sets subscription_status to past_due on failed payment', async () => {
    mockConstructEvent.mockReturnValue({
      type: 'invoice.payment_failed',
      data: { object: { subscription: 'sub_123' } },
    })

    await POST(makeRequest({}))

    expect(mockUpdate).toHaveBeenCalledWith({ subscription_status: 'past_due' })
    expect(mockEq).toHaveBeenCalledWith('stripe_subscription_id', 'sub_123')
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
