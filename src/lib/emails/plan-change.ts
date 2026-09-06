import { emailShell, emailButton, escapeHtml, firstNameOf, SITE_URL } from './layout';
import { PLAN_NAMES, type Plan } from '@/lib/plans';

const LIBRARY_URL = `${SITE_URL}/library`;

export function planChangeEmail(
  name: string | null,
  newPlan: Plan,
): { subject: string; html: string } {
  const firstName = firstNameOf(name);
  const planName = PLAN_NAMES[newPlan];
  const subject = `You're now on ${planName}`;

  const summary = newPlan === 'pro_subscriber'
    ? "You now have full access to your Video Library, plus this month's live webinar with Tapas and the full recording archive."
    : "You now have full access to your Video Library.";

  const content = `
              <h1 class="email-h1" style="margin:0 0 16px;font-family:'Georgia',serif;font-size:30px;font-weight:500;color:#1C1007;line-height:1.3;">
                Welcome to ${planName}${firstName ? `, ${escapeHtml(firstName)}` : ''}.
              </h1>
              <p style="margin:0 0 8px;font-size:17px;color:#1C1007;line-height:1.7;">
                Your membership has been updated.
              </p>
              <p style="margin:0;font-size:17px;color:rgba(28,16,7,0.65);line-height:1.7;">
                ${summary}
              </p>
              ${emailButton(LIBRARY_URL, 'Go to your Video Library &rarr;')}`;

  const html = emailShell({
    title: subject,
    eyebrow: 'Membership',
    content,
    footerNote: 'Cancel anytime from your account settings.',
  });

  return { subject, html };
}
