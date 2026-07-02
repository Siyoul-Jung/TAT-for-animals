import { emailShell, emailButton } from './layout';

type Plan = 'subscriber' | 'pro_subscriber';

const PLAN_NAMES: Record<Plan, string> = {
  subscriber: 'The Calm Library',
  pro_subscriber: 'The Calm Circle',
};

const LIBRARY_URL = `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://tatforanimals.com'}/library`;

export function welcomeEmail(
  name: string | null,
  plan: Plan,
  interval: 'month' | 'year',
): { subject: string; html: string } {
  const firstName = name?.split(' ')[0] ?? 'there';
  const planName = PLAN_NAMES[plan];
  const isCircle = plan === 'pro_subscriber';
  const isAnnual = interval === 'year';

  const subject = `Welcome to TAT for Animals, ${firstName}`;

  // What they get — one calm line, adapts to the tier (no decorative list).
  const summary = isCircle
    ? 'Your full video library and monthly live webinars with Tapas are ready whenever you are.'
    : 'Your full video library is ready whenever you are.';

  // Billing terms restated in the welcome — California's auto-renewal law asks
  // the confirmation to state the renewal terms, how to cancel, and (for annual)
  // the refund window. Kept readable (14px), not buried small print.
  const annualPrice = isCircle ? '470' : '270';
  const billingTerms = isAnnual
    ? `Your membership is billed once a year at $${annualPrice} (two months free compared with paying monthly) and renews automatically each year until you cancel. We'll email a reminder before each renewal, and you can cancel anytime from your account settings. If it isn't the right fit, you can request a refund within 14 days of purchase.`
    : `Your membership renews automatically each month until you cancel — you can cancel anytime from your account settings.`;

  const content = `
              <h1 class="email-h1" style="margin:0 0 16px;font-family:'Georgia',serif;font-size:30px;font-weight:500;color:#1C1007;line-height:1.3;">
                Welcome, ${firstName}.
              </h1>
              <p style="margin:0 0 8px;font-size:17px;color:#1C1007;line-height:1.7;">
                You've joined <strong style="font-weight:600;">${planName}</strong>.
              </p>
              <p style="margin:0;font-size:17px;color:rgba(28,16,7,0.65);line-height:1.7;">
                ${summary}
              </p>
              ${emailButton(LIBRARY_URL, 'Go to your library &rarr;')}
              <p style="margin:28px 0 0;font-size:14px;color:rgba(28,16,7,0.6);line-height:1.7;">
                ${billingTerms}
              </p>`;

  const html = emailShell({
    title: subject,
    // "Hello" here (not "Welcome") so it doesn't repeat the h1 "Welcome,
    // [name]" right below — reads as one line top-to-bottom instead of two
    // (Jez's suggestion, 2026-07-02).
    eyebrow: 'Hello',
    content,
    footerNote: 'Cancel anytime from your account settings.',
  });

  return { subject, html };
}
