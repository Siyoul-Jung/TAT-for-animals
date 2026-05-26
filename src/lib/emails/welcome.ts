type Plan = 'subscriber' | 'pro_subscriber';

const PLAN_NAMES: Record<Plan, string> = {
  subscriber: 'The Calm Library',
  pro_subscriber: 'The Calm Circle',
};

const LIBRARY_URL = 'https://tatforanimals.com/library/animals';

export function welcomeEmail(name: string | null, plan: Plan): { subject: string; html: string } {
  const firstName = name?.split(' ')[0] ?? 'there';
  const planName = PLAN_NAMES[plan];
  const isCircle = plan === 'pro_subscriber';

  const subject = `Welcome to TAT for Animals, ${firstName}`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background:#FBF5F3;font-family:'Georgia',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FBF5F3;padding:48px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

          <!-- Header -->
          <tr>
            <td style="padding-bottom:40px;">
              <p style="margin:0;font-family:'Helvetica Neue',sans-serif;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#5E9635;font-weight:600;">
                TAT for Animals
              </p>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding-bottom:32px;border-bottom:1px solid rgba(28,16,7,0.08);">
              <h1 style="margin:0 0 16px;font-size:32px;font-weight:500;color:#1C1007;line-height:1.3;">
                Welcome, ${firstName}.
              </h1>
              <p style="margin:0;font-family:'Helvetica Neue',sans-serif;font-size:17px;color:rgba(28,16,7,0.6);line-height:1.7;font-weight:300;">
                You've joined <strong style="color:#1C1007;font-weight:500;">${planName}</strong> —
                and your animal is already a little closer to calm.
              </p>
            </td>
          </tr>

          <!-- What's included -->
          <tr>
            <td style="padding:32px 0;">
              <p style="margin:0 0 20px;font-family:'Helvetica Neue',sans-serif;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:rgba(212,112,58,0.7);font-weight:500;">
                What's waiting for you
              </p>
              <table cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="padding:12px 0;border-bottom:1px solid rgba(28,16,7,0.06);">
                    <p style="margin:0;font-family:'Helvetica Neue',sans-serif;font-size:15px;color:#1C1007;">
                      TAT for Animals video library
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 0;border-bottom:1px solid rgba(28,16,7,0.06);">
                    <p style="margin:0;font-family:'Helvetica Neue',sans-serif;font-size:15px;color:#1C1007;">
                      Healing ACEs Plus video library
                    </p>
                  </td>
                </tr>
                ${isCircle ? `
                <tr>
                  <td style="padding:12px 0;border-bottom:1px solid rgba(28,16,7,0.06);">
                    <p style="margin:0;font-family:'Helvetica Neue',sans-serif;font-size:15px;color:#1C1007;">
                      Monthly live webinars with Tapas
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 0;">
                    <p style="margin:0;font-family:'Helvetica Neue',sans-serif;font-size:15px;color:#1C1007;">
                      Full archive of all past recordings
                    </p>
                  </td>
                </tr>
                ` : `
                <tr>
                  <td style="padding:12px 0;">
                    <p style="margin:0;font-family:'Helvetica Neue',sans-serif;font-size:15px;color:#1C1007;">
                      Self-guided practice materials
                    </p>
                  </td>
                </tr>
                `}
              </table>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding-bottom:40px;">
              <a href="${LIBRARY_URL}"
                style="display:inline-block;padding:14px 32px;background:#D4703A;color:#FBF5F3;font-family:'Helvetica Neue',sans-serif;font-size:15px;font-weight:600;text-decoration:none;border-radius:100px;">
                Go to your library →
              </a>
            </td>
          </tr>

          <!-- Quote -->
          <tr>
            <td style="padding:32px 0;border-top:1px solid rgba(28,16,7,0.08);">
              <p style="margin:0 0 12px;font-size:20px;font-style:italic;color:rgba(28,16,7,0.7);line-height:1.6;">
                &ldquo;Help people find peace. One person — and one animal — at a time.&rdquo;
              </p>
              <p style="margin:0;font-family:'Helvetica Neue',sans-serif;font-size:12px;letter-spacing:0.2em;text-transform:uppercase;color:rgba(28,16,7,0.35);">
                — Tapas Fleming
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top:32px;border-top:1px solid rgba(28,16,7,0.08);">
              <p style="margin:0 0 8px;font-family:'Helvetica Neue',sans-serif;font-size:12px;color:rgba(28,16,7,0.35);line-height:1.6;">
                You can cancel your membership anytime from your account settings.
              </p>
              <p style="margin:0;font-family:'Helvetica Neue',sans-serif;font-size:12px;color:rgba(28,16,7,0.25);">
                © 2026 TATLife®, Inc. · tatforanimals.com
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  return { subject, html };
}
