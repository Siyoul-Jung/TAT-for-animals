import { emailShell } from './layout';

type Plan = 'subscriber' | 'pro_subscriber';

const PLAN_NAMES: Record<Plan, string> = {
  subscriber: 'The Calm Library',
  pro_subscriber: 'The Calm Circle',
};

// What the member will be charged at renewal. Annual = monthly × 10 (two months
// free): $27→$270, $47→$470. Used for the heads-up only; the actual charge is
// made by Stripe/PayPal.
const ANNUAL_PRICE: Record<Plan, string> = {
  subscriber: '$270',
  pro_subscriber: '$470',
};

const DASHBOARD_URL = `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://tatforanimals.com'}/dashboard`;

// Sent a few days before an annual subscription renews. Annual members pay a
// large amount once a year, so a clear heads-up before the charge is both an
// industry norm and a legal requirement in some regions — and it heads off
// surprise-charge disputes. Reassuring, not salesy: nothing is required of them.
export function annualRenewalReminderEmail(
  name: string | null,
  plan: Plan,
  renewalDateLabel: string,
): { subject: string; html: string } {
  const firstName = name?.split(' ')[0] ?? 'there';
  const planName = PLAN_NAMES[plan];
  const amount = ANNUAL_PRICE[plan];

  const subject = `Your membership renews on ${renewalDateLabel}`;

  const content = `
              <h1 class="email-h1" style="margin:0 0 16px;font-family:'Georgia',serif;font-size:30px;font-weight:500;color:#1C1007;line-height:1.3;">
                Your upcoming renewal
              </h1>
              <p style="margin:0 0 8px;font-size:17px;color:#1C1007;line-height:1.7;">
                Hi ${firstName}, your <strong style="font-weight:600;">${planName}</strong> membership renews on
                <strong style="font-weight:600;">${renewalDateLabel}</strong> for <strong style="font-weight:600;">${amount}</strong>.
              </p>
              <p style="margin:0;font-size:17px;color:rgba(28,16,7,0.65);line-height:1.7;">
                No action is required; it will renew automatically. To update or cancel, manage your membership below.
              </p>
              <!-- Quiet text link, not a filled CTA: this is an FYI notice, so the
                   action shouldn't dominate or read as "act now". -->
              <p style="margin:28px 0 0;">
                <a href="${DASHBOARD_URL}" style="display:inline-block;min-height:44px;line-height:44px;font-size:16px;font-weight:600;color:#467826;text-decoration:underline;">
                  Manage membership &rarr;
                </a>
              </p>`;

  // No footerNote: the body already states the cancel path ("To update or
  // cancel, manage your membership below"), so a footer line would duplicate it.
  const html = emailShell({
    title: subject,
    eyebrow: 'Renewal reminder',
    content,
    preheader: `Your ${planName} membership renews on ${renewalDateLabel} for ${amount}.`,
  });

  return { subject, html };
}
