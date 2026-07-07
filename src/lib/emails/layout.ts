// Shared shell for every transactional email.
// One place owns the cream page, the centered white card, mobile padding,
// the green eyebrow, and the footer — so all emails stay consistent and
// any future template inherits mobile + AA for free.
//
// Mobile note: some clients strip <style>/media queries, so the INLINE values
// must already look acceptable on a phone. The media query only *tightens*
// padding/heading on small screens where it's supported (Gmail, Apple Mail,
// Outlook app). Nothing breaks if it's dropped.

// Base URL for links inside emails — one place, matching every template's
// previous inline fallback.
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://tatforanimals.com';

// Escape the five HTML-special characters for strings interpolated into email
// bodies. The values come from trusted authors (Stripe checkout names, Sanity
// titles Jez writes) — this isn't an injection defense so much as rendering
// safety: an innocent title like "Webinar <May>" would otherwise swallow the
// rest of the line.
export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// First name for greetings, shared by every template. trim + whitespace split
// so a padded name can't yield an empty string ("Welcome, ." — the ?? fallback
// doesn't catch ''), matching the dashboard's derivation. Returned RAW: escape
// with escapeHtml() at HTML interpolation sites, but use as-is in subjects —
// a subject line is plain text, and "O&#39;Brien" there would be worse than
// the problem being solved.
export function firstNameOf(name: string | null | undefined): string {
  return name?.trim().split(/\s+/)[0] || 'there';
}

type ShellOptions = {
  title: string;        // <title> + browser tab
  eyebrow: string;      // small green uppercase label
  content: string;      // inner HTML: heading, paragraphs, button
  footerNote?: string;  // optional line above the copyright
  preheader?: string;   // hidden inbox-preview text (the snippet shown in the list)
};

export function emailShell({ title, eyebrow, content, footerNote, preheader }: ShellOptions): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="x-apple-disable-message-reformatting" />
  <title>${escapeHtml(title)}</title>
  <style>
    @media only screen and (max-width:480px) {
      .email-outer { padding: 24px 10px !important; }
      .email-card  { padding: 32px 22px !important; }
      .email-h1    { font-size: 25px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background:#FBF5F3;font-family:'Helvetica Neue',Arial,sans-serif;-webkit-text-size-adjust:100%;">
  ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:#FBF5F3;">${escapeHtml(preheader)}</div>` : ''}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="email-outer" style="background:#FBF5F3;padding:48px 16px;">
    <tr>
      <td align="center">

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" align="center" style="max-width:480px;background:#ffffff;border:1px solid rgba(28,16,7,0.06);border-radius:24px;">
          <tr>
            <td align="center" class="email-card" style="padding:48px 40px;text-align:center;">

              <!-- Logo (image blocked? the green wordmark below still carries the brand) -->
              <img src="${SITE_URL}/images/logo2.png" alt="TAT for Animals" width="44" height="44" style="display:block;margin:0 auto 16px;border:0;outline:none;text-decoration:none;" />

              <!-- Eyebrow -->
              <p style="margin:0 0 24px;font-size:13px;letter-spacing:0.2em;text-transform:uppercase;color:#467826;font-weight:600;">
                ${eyebrow}
              </p>

              ${content}

              <!-- Footer -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:36px;">
                <tr>
                  <td style="padding-top:28px;border-top:1px solid rgba(28,16,7,0.08);text-align:center;">
                    ${footerNote ? `<p style="margin:0 0 8px;font-size:13px;color:rgba(28,16,7,0.6);line-height:1.6;">${footerNote}</p>` : ''}
                    <!-- Why-received line: marks these as account/transactional mail
                         (helps deliverability and sets expectations). -->
                    <p style="margin:0 0 6px;font-size:13px;color:rgba(28,16,7,0.6);line-height:1.6;">
                      You're receiving this because you have a TAT for Animals account.
                    </p>
                    <p style="margin:0 0 6px;font-size:13px;color:rgba(28,16,7,0.6);line-height:1.6;">
                      Questions? <a href="mailto:hello@tatforanimals.com" style="color:#467826;text-decoration:underline;">hello@tatforanimals.com</a>
                    </p>
                    <!-- Postal address (CAN-SPAM): provided by Tapas 2026-06-23.
                         Currently her home address; swap for a PO box if she moves to one. -->
                    <p style="margin:0 0 6px;font-size:13px;color:rgba(28,16,7,0.6);line-height:1.6;">
                      TATLife&reg;, Inc. &middot; 1317 Portola Ave., Torrance, CA 90501
                    </p>
                    <p style="margin:0;font-size:13px;color:rgba(28,16,7,0.6);">
                      &copy; 2026 TATLife&reg;, Inc. &middot; tatforanimals.com
                    </p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

// Pill button. Orange = a welcome "go" action; charcoal = a destructive
// action (delete) that must NOT read as the happy brand colour.
// 19px/700 white-on-orange clears WCAG AA via the large-text 3:1 threshold.
export function emailButton(
  href: string,
  label: string,
  opts?: { destructive?: boolean }
): string {
  const bg = opts?.destructive ? '#1C1007' : '#D4703A';
  const color = opts?.destructive ? '#FBF5F3' : '#ffffff';
  return `
              <table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin:36px auto 0;">
                <tr>
                  <td align="center" style="border-radius:100px;background:${bg};">
                    <a href="${href}"
                      style="display:inline-block;padding:16px 36px;color:${color};font-size:19px;font-weight:700;text-decoration:none;border-radius:100px;">
                      ${label}
                    </a>
                  </td>
                </tr>
              </table>`;
}
