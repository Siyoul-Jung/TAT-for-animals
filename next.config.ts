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
    // request, it only reports violations to the browser console. This lets us
    // observe what a real policy would break (Vimeo, Sanity Studio, Stripe,
    // PayPal, Termageddon, Mailchimp) before switching to an enforcing policy.
    const cspReportOnly = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://www.paypal.com https://www.paypalobjects.com https://player.vimeo.com https://*.vimeocdn.com https://*.sanity.io https://app.termageddon.com https://*.mailchimp.com https://*.list-manage.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com https://*.sanity.io wss://*.sanity.io https://*.vimeo.com https://*.paypal.com",
      "frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://player.vimeo.com https://www.paypal.com https://app.termageddon.com",
      "frame-ancestors 'self'",
      "base-uri 'self'",
      "form-action 'self' https://www.paypal.com https://checkout.stripe.com",
      "object-src 'none'",
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
