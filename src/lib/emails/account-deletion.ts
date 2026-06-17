import { emailShell, emailButton } from './layout';

export function accountDeletionEmail(confirmUrl: string): { subject: string; html: string } {
  const subject = 'Confirm your account deletion — TAT for Animals';

  const content = `
              <h1 class="email-h1" style="margin:0 0 16px;font-family:'Georgia',serif;font-size:28px;font-weight:500;color:#1C1007;line-height:1.3;">
                Confirm account deletion
              </h1>
              <p style="margin:0 0 8px;font-size:17px;color:#1C1007;line-height:1.7;">
                We received a request to delete your TAT for Animals account.
              </p>
              <p style="margin:0;font-size:17px;color:rgba(28,16,7,0.65);line-height:1.7;">
                If this was you, confirm below. This link expires in 24 hours &mdash; if you didn't request this, you can safely ignore this email.
              </p>
              ${emailButton(confirmUrl, 'Yes, delete my account &rarr;', { destructive: true })}`;

  const html = emailShell({
    title: subject,
    eyebrow: 'Account',
    content,
  });

  return { subject, html };
}
