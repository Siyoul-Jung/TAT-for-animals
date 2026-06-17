---
name: pre-ship
description: Run the project's independent review loop before deploying — fan out the qa-reviewer (user-facing flows) and design-reviewer (WCAG/brand/responsive) agents over the current changes, then consolidate their findings into one prioritized, deduped fix list. Use BEFORE merging to main / deploying, or when the user asks to "pre-ship", "ship-check", "audit before deploy", or "run the review loop". This is a solo-developer safety net: it catches what one pair of eyes misses. It does NOT review code correctness/cleanup (use /code-review) or security (use /security-review) — it covers UX flows + accessibility + brand/design.
---

# Pre-ship review loop

A repeatable build → independent-review → prioritized-fixlist loop, tuned for this
project. The goal: nothing reaches the client (Tapas/Jez) or production that an
independent pass would have caught. Review only — never edit in this skill; surface
findings and let the user choose what to fix.

## 1. Scope the changes

Figure out what actually changed, so the reviewers focus (don't audit the whole app):

```
git diff --stat main...HEAD          # committed but not yet on main
git status --short                    # uncommitted working tree
```

Build two lists from the changed files:
- **Flows touched** — anything under auth (login/signup/reset/update), checkout,
  subscription (upgrade/change-plan/portal/cancel), account deletion, library access,
  or a redirect/route. → goes to qa-reviewer.
- **Surfaces touched** — any page or component the user sees (`src/components/*`,
  `src/app/**/page.tsx` and their client components). → goes to design-reviewer.

If there is no diff vs main, review the working tree. If the user named an area, scope to it.

## 2. Fan out the two project reviewers (in parallel)

Launch both in a single message so they run concurrently. Pass the concrete changed
files/flows, not the whole app:

- **qa-reviewer** — "Review these changed user-facing flows for dead ends, broken or
  inconsistent redirects, button-vs-behavior mismatches, and emotional-friction points.
  For each finding: file:line, user-visible impact, severity (blocker/should-fix/polish).
  Findings only." + the flow list.
- **design-reviewer** — "Audit these changed pages/components for WCAG AA (contrast,
  ≥44px touch targets, focus, alt text), responsive/clip risks, and color/font/spacing
  token violations. For each: file:line, the threshold/token missed, severity. Findings
  only." + the surface list.

For a heavier, exhaustive pass (user says "thorough"/"deep"), also run `/code-review`
for correctness and consider `/security-review` if payment/auth/webhook code changed.

## 3. Consolidate

When both return, merge into ONE list — do not just paste both reports:
- Dedupe overlapping findings.
- Group by severity: **Blockers** → **Should-fix** → **Polish / needs-human-eyes**.
- Keep file:line on each.
- For anything the reviewers flag that needs a rendered screenshot to confirm
  (clipping, emotional tone), capture it with the playwright pattern and judge, or
  list it under "needs human eyes."

## 4. Project ground truth (so reviewers don't false-positive)

- **Live palette is `src/app/globals.css`**, not CLAUDE.md. Current: `green #467826`,
  `muted #7A5F4F`, brand orange `#D4703A`, footer `#1E3310` (the one intentional green
  background). Audit contrast against these.
- **Senior-first, anti-AI-gloss**: simple, warm, one purpose per screen. Body ≥16px,
  eyebrow ≥12px, touch targets ≥44px, visible focus, `prefers-reduced-motion` honored.
- **Stripe is a shared account in test mode** pre-launch; bright orange `#D4703A` on
  white only clears AA at large text (≥19px bold) — that's the rule CTAs rely on.

## 5. Present, don't fix

Show the consolidated list with a recommended cut line ("fix these before shipping;
defer these"). Then stop and let the user decide. Apply fixes only on their go-ahead,
on a branch, committed by concern — never push without explicit instruction.
