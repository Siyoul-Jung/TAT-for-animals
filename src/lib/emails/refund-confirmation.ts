import { emailShell, escapeHtml, firstNameOf } from './layout';

// Sent by /api/annual-refund when a member cancels within the 14-day window —
// the ONLY email that path sends (the webhooks' cancellation emails are
// suppressed via the refund-cancel-<subId> claim, since their "access until
// period end" copy would be wrong here: access ends now, money comes back).
export function refundConfirmationEmail(
  name: string | null,
  amount: string | null, // already formatted, e.g. "$270.00" — null if unknown
): { subject: string; html: string } {
  const firstName = firstNameOf(name);
  const subject = `Your membership is cancelled and your refund is on the way`;

  const amountPhrase = amount
    ? `your full payment of <strong style="font-weight:600;">${escapeHtml(amount)}</strong>`
    : 'your full payment';

  // No CTA by design (same reasoning as cancellation.ts): someone who just
  // asked for their money back shouldn't be sold to. Confirm both facts
  // plainly — cancelled, refunded — and say when the money lands.
  const content = `
              <h1 class="email-h1" style="margin:0 0 16px;font-family:'Georgia',serif;font-size:30px;font-weight:500;color:#1C1007;line-height:1.3;">
                All taken care of, ${escapeHtml(firstName)}.
              </h1>
              <p style="margin:0 0 8px;font-size:17px;color:#1C1007;line-height:1.7;">
                Your membership has been cancelled, and ${amountPhrase} is being refunded
                to your original payment method.
              </p>
              <p style="margin:0;font-size:17px;color:rgba(28,16,7,0.65);line-height:1.7;">
                Refunds usually arrive within 5&ndash;10 business days, depending on your bank.
                You're welcome to return anytime.
              </p>`;

  const html = emailShell({
    title: subject,
    eyebrow: 'Membership',
    content,
  });

  return { subject, html };
}
