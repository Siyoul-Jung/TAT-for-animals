import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  cacheComponents: true,
  experimental: {
    instantNavigationDevToolsToggle: true,
  },
  async redirects() {
    // 직관적으로 입력할 수 있는 별칭 경로 → 실제 경로로 연결 (404 방지)
    return [
      { source: "/join", destination: "/membership", permanent: true },
      { source: "/sign-in", destination: "/login", permanent: true },
      { source: "/signin", destination: "/login", permanent: true },
      { source: "/register", destination: "/signup", permanent: true },
    ];
  },
  async headers() {
    // Content-Security-Policy is shipped in REPORT-ONLY mode: it never blocks a
    // request, it only reports violations (browser console + POST to
    // /api/csp-report → Vercel logs). This lets us observe what a real policy
    // would break (Vimeo, Sanity Studio, Stripe, PayPal, Termageddon, Mailchimp)
    // before switching to an enforcing policy. Before enforcing: click through
    // Stripe checkout, PayPal checkout, video playback, and /studio, then
    // confirm the csp-report logs stayed quiet.
    const cspReportOnly = [
      "default-src 'self'",
      // Termageddon is wildcarded: the embed script loads from
      // policies.termageddon.com and then fetches the policy body from
      // embed.termageddon.com — the first real csp-report catch (2026-07-08,
      // /privacy). The originally-listed app.termageddon.com is not used at all.
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://www.paypal.com https://www.paypalobjects.com https://player.vimeo.com https://*.vimeocdn.com https://*.sanity.io https://*.termageddon.com https://*.mailchimp.com https://*.list-manage.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com https://*.sanity.io wss://*.sanity.io https://*.vimeo.com https://*.paypal.com https://*.termageddon.com",
      "frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://player.vimeo.com https://www.paypal.com https://*.termageddon.com",
      // Sanity Studio spawns blob: web workers; without worker-src they'd fall
      // back to script-src (which has no blob:) once the policy is enforced.
      "worker-src 'self' blob:",
      "frame-ancestors 'self'",
      "base-uri 'self'",
      "form-action 'self' https://www.paypal.com https://checkout.stripe.com",
      "object-src 'none'",
      // Violations from real browsing land in /api/csp-report (Vercel logs) —
      // the promotion-to-enforcing decision reads those, not someone's console.
      "report-uri /api/csp-report",
    ].join("; ");

    return [
      {
        source: "/:path*",
        headers: [
          // Enforced (safe) headers — no known break risk for this site.
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          // Report-only: observe, don't block. Promote to Content-Security-Policy
          // once the console shows no legitimate violations.
          { key: "Content-Security-Policy-Report-Only", value: cspReportOnly },
        ],
      },
    ];
  },
  turbopack: {
    // Explicitly pin the filesystem root so Turbopack's PostCSS worker pool
    // resolves modules from this project, not the parent c:\dev directory.
    root: __dirname,
  },
  webpack: (config) => {
    // Fallback fix for --webpack mode: ensure project node_modules is searched first.
    config.resolve.modules = [
      path.resolve(__dirname, "node_modules"),
      ...(config.resolve.modules ?? ["node_modules"]),
    ];
    return config;
  },
};

export default nextConfig;
