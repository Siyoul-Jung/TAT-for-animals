# TAT for Animals — Task List

*Last updated: April 26, 2026*

---

## 📋 This Meeting — Agenda (Tapas)

- [ ] **Design direction** — Tapas and Bruce to discuss further. Awaiting outcome before proceeding with visual design
- [ ] **Font selection** — Show `/font-preview` page and let Tapas choose
- [x] **Homepage video** — Tapas confirmed she will record a new 3–4 min TAT for Animals intro video
- [x] **Membership pricing** — Confirmed: $27/mo (The Calm Library) / $47/mo (The Calm Circle)
- [x] **Membership tier names** — Confirmed: The Calm Library / The Calm Circle
- [ ] **Animal healing stories** — Homepage Stories section needs 2–3 real stories. When can Tapas / Jez provide these?
- [x] **Tapas photo** — Received
- [ ] **PayPal account** — Checking with Jez

---

## 🗂 Pages — Scope Overview

6 pages total:

| Page | Status |
|------|--------|
| `/` — Homepage (Hero · How It Works · Stories · Membership · About Tapas) | 🔲 Not started |
| `/membership` — 2-tier pricing + signup flow | 🔲 Not started |
| `/dashboard` — Video library + webinar recordings (members only) | 🔲 Not started |
| `/login` — Email / password login | 🔲 Not started |
| `/about` — Tapas intro + TAT for Animals story | 🔲 Not started |
| `/faq` — Frequently asked questions | ✅ Draft done |

---

## 🔴 Immediate

- [ ] Review tatlife.com backend — understand TAT for Animals membership section structure
- [x] Review all videos — assess whether re-recording is needed
  - Analyzed: Chapter 2 (Tips, TAT Terms, Poses), Chapter 3 (Three Blockages, Cat/Dog, Five Essential Ways, Animal Has Passed, Acting Weird)
  - Conclusion: existing videos are solid dashboard content. New 3–4 min homepage intro video confirmed (Tapas to record)

---

## 🟠 Before Next Meeting

- [x] Font comparison page — `/font-preview` implemented, 2–3 sans-serif options (awaiting Tapas selection)
- [x] Timeline + cost estimate — `docs/estimate.md` (7 weeks / 140 hours + infra costs)
- [ ] SRS — review tatlife.com backend and update dashboard requirements if needed

---

## 🟡 Development (ready to start)

- [x] Navigation — simplified to `[Logo] + [Join]`
- [x] Removed unused pages — `/for-your-animal`, `/work-with-tapas`, `/session`
- [x] `/faq` page — accordion, 12 Q&As for first-time visitors
- [x] Supabase `video_watch_events` table — created with RLS + indexes
- [ ] Homepage — restructure for TAT for Animals (Hero → How It Works → Stories → Membership · About Tapas)
- [ ] Sanity CMS schema — videos + webinar recordings (4 categories: Foundational · Main · Bonus 2025 · Bonus 2026)
- [ ] Dashboard — webinar schedule + invitation emails + recording upload notifications
- [ ] Footer — copyright notice + link to tatlife.com

---

## 🔵 Waiting On

- [ ] **Jez** — existing TAT for Animals subscriber list
- [ ] **Jez** — videos, webinar recordings, testimonials, Tapas photos, PayPal account info
- [ ] **Self** — check tatlife.com for existing Privacy Policy text to reuse/adapt
- [ ] **Tapas** — animal healing stories for homepage, font selection, design direction, bio text for /about + homepage About section
- [x] **Tapas** — membership tier names + pricing confirmed
- [x] **Tapas** — tatforanimals.com domain purchased + Vercel DNS connected

---

## 🟢 Later

- [ ] Marketing strategy research
- [ ] Competitor / reference site analysis
- [ ] SEO keyword research (animal healing)
- [ ] Pre/post-launch marketing plan
