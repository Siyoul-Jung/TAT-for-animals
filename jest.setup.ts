import '@testing-library/jest-dom'

// Price / plan IDs — must be set before route & lib modules load, because the
// price→role and plan→role maps are built at module init from these env vars.
process.env.STRIPE_PRICE_CALM_LIBRARY        = 'price_library'
process.env.STRIPE_PRICE_CALM_CIRCLE         = 'price_circle'
process.env.STRIPE_PRICE_CALM_LIBRARY_ANNUAL = 'price_library_annual'
process.env.STRIPE_PRICE_CALM_CIRCLE_ANNUAL  = 'price_circle_annual'

process.env.PAYPAL_PLAN_CALM_LIBRARY         = 'P-lib-monthly'
process.env.PAYPAL_PLAN_CALM_CIRCLE          = 'P-circle-monthly'
process.env.PAYPAL_PLAN_CALM_LIBRARY_ANNUAL  = 'P-lib-annual'
process.env.PAYPAL_PLAN_CALM_CIRCLE_ANNUAL   = 'P-circle-annual'
