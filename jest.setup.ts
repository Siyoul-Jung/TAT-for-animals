import '@testing-library/jest-dom'

// Stripe price IDs — must be set before route modules load (PRICE_ROLE_MAP is built at module init)
process.env.STRIPE_PRICE_CALM_LIBRARY = 'price_library'
process.env.STRIPE_PRICE_CALM_CIRCLE  = 'price_circle'
