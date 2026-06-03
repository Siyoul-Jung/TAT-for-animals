/**
 * Wraps a client so it is constructed on first use rather than at import time.
 *
 * Next.js evaluates route/page modules during the production build's
 * "Collecting page data" step. Clients created at module top-level (Stripe,
 * Sanity, Supabase admin, Resend) throw when their env vars are absent, which
 * fails the build on any environment that lacks secrets at build time (e.g.
 * Vercel Preview). Deferring construction to the first property access keeps
 * the build env-independent — the client is only built when a request actually
 * uses it, by which point the runtime env is present.
 */
export function lazyClient<T extends object>(factory: () => T): T {
  let instance: T | null = null
  const resolve = (): T => (instance ??= factory())

  return new Proxy({} as T, {
    get(_target, prop, receiver) {
      const target = resolve()
      const value = Reflect.get(target, prop, receiver)
      // Bind methods so `this` stays the real client (e.g. stripe.subscriptions)
      return typeof value === 'function' ? value.bind(target) : value
    },
    has(_target, prop) {
      return prop in resolve()
    },
  })
}
