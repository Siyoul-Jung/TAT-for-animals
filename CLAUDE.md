@AGENTS.md
@docs/private/srs_tat_for_animals.md
@docs/private/design_spec.md

# TAT® Calm — 프로젝트 가이드라인

## ⭐ 핵심 설계 원칙 (모든 작업의 최우선 기준)

> 모든 UI, 기능, 카피, 인터랙션 결정 전에 이 다섯 가지를 먼저 확인한다.

| 원칙 | 의미 |
|------|------|
| **Simple / Minimal** | 불필요한 요소 없음. 한 화면에 하나의 목적. |
| **Easy** | 설명 없이 직관적으로 사용 가능. "70세 사용자가 혼자 쓸 수 있는가?" |
| **Senior-friendly** | Tapas의 핵심 사용자층. 이들이 편하면 모두가 편함. |
| **WCAG AA** | 대비율 4.5:1 이상, 터치 타겟 44px 이상, 포커스 표시 필수. |
| **경험/체험 중심** | 정보 전달 ❌ → 감각적 체험 ✅. 방문자가 먼저 느끼고, 그 다음 이해한다. |
| **사람 냄새** | AI 감성 ❌ → 인간적 온기 ✅. 완벽하게 정제된 느낌보다 Tapas라는 실존 인물의 체온이 느껴져야 한다. |

**AI 감성 체크리스트 (이런 게 보이면 다시 생각):**
- 떠다니는 뱃지, 완벽한 그라디언트 카드, 과도하게 둥근 모서리
- "Empowering your journey" 같은 공허한 마케팅 카피
- 숫자 통계 나열 ("500K+ 도달", "80+ 개국") — 숫자보다 실제 이야기
- 격자형으로 딱 맞아떨어지는 기능 카드 3개 나란히
- 주인공이 없는 디자인 — Tapas의 얼굴과 목소리가 항상 중심에 있어야 함

**실전 체크리스트:**
- 드롭다운, 탭, 아코디언 같은 "숨겨진 UI" → 기본적으로 지양
- 기술 용어 ("Dashboard", "Magic Link") → 평문으로 대체
- 에러 메시지 → 박스 형태 + 해결 방법 안내
- 로딩 상태 → 반드시 시각적 피드백
- "Cancel anytime" → 항상 눈에 띄게

---

## 프로젝트 개요
tatforanimals.com — TAT for Animals 전용 독립 멤버십 플랫폼 신규 구축 프로젝트입니다.
tatlife.com과 완전히 분리된 독립 사이트입니다.
자세한 내용은 위에 참조된 `srs_tat_for_animals.md` 및 `design_spec.md`를 확인하세요.

---

## 기술 스택
- **프레임워크**: Next.js 16 (App Router, Turbopack, `cacheComponents`) + TypeScript
- **스타일링**: Tailwind CSS v4 (`@theme inline` 방식 — `tailwind.config` 없음)
- **애니메이션**: Framer Motion v12
- **아이콘**: lucide-react
- **유틸리티**: clsx + tailwind-merge (`cn()` 헬퍼, `src/lib/utils.ts`)

---

## 파일 구조

```
src/
├── middleware.ts                         — 보호 라우트(/dashboard·/library) 세션 검사
├── app/
│   ├── layout.tsx                        — 폰트(JUST Sans Regular, 헤딩+본문 공통) + Navbar/Footer
│   ├── globals.css                       — CSS 변수 및 Tailwind @theme 토큰
│   ├── error.tsx · global-error.tsx      — 에러 바운더리(레이아웃 / 루트 크래시)
│   ├── not-found.tsx                     — 404
│   ├── page.tsx                          — 홈페이지
│   ├── about/                            — Tapas 이야기 (별도 페이지)
│   ├── membership/                       — 가격 카드 + 가입 플로우
│   ├── checkout/                         — 결제 확인(카드/PayPal 선택, plan 파라미터)
│   ├── dashboard/                        — 내 계정 (구독 정보, 콘텐츠 링크)
│   ├── library/                          — 라이브러리 (animals / aces / webinars 탭)
│   ├── login/ · signup/                  — 인증 페이지
│   ├── reset-password/ · update-password/
│   ├── faq/ · contact/                   — FAQ · 문의
│   ├── privacy/ · terms/ · disclaimer/   — 법률(Termageddon 임베드)
│   ├── thank-you/                        — 결제 완료 페이지
│   ├── studio/[[...tool]]/               — Sanity Studio
│   ├── auth/callback/                    — Supabase 매직링크/OAuth 콜백 (기본: /dashboard)
│   └── api/
│       ├── checkout/ · checkout/verify/  — Stripe 체크아웃 생성 · 리턴 검증(웹훅 지연 폴백)
│       ├── change-plan/                  — 업/다운그레이드 (Stripe update · PayPal revise)
│       ├── portal/                       — Stripe 구독 관리 포털
│       ├── paypal/checkout · success · cancel/
│       ├── request-account-deletion · confirm-account-deletion/
│       ├── send/webinar-invite · recording-notification/  (Sanity 웹훅, fail-closed 인증)
│       ├── webhooks/ stripe · paypal/    — 구독 상태 동기화 (멱등성 + 실패 롤백/알림)
│       ├── cron/annual-renewal-reminder/ — 연간 갱신 사전 고지 (Vercel Cron)
│       ├── contact/ · calendar/webinar/  — 문의 폼 · .ics 다운로드
│       ├── auth/logout/ · health/        — 로그아웃 · 라이브니스
│       └── review-feedback/              — (임시) 검수 피드백 이메일
│
├── components/                           — Navbar, Hero, TrySession, Testimonials, Pricing,
│                                           RecordingTestimonials, AboutTapas, NewsletterSignup,
│                                           Footer, CookieBanner, TermageddonPolicy, AccountNotice,
│                                           ScrollToTop, BackToTopButton, MotionProvider, LogoMark,
│                                           ui/Button
│
├── lib/
│   ├── stripe.ts · paypal.ts · sanity.ts · resend.ts   — 외부 클라이언트 (전부 lazy 초기화)
│   ├── lazyClient.ts                     — env 없이 빌드되도록 클라이언트 지연 생성 Proxy
│   ├── subscriptionAccess.ts · access.ts · reconcileAccess.ts — 가격→역할 매핑 · 접근 판정 · 자가치유
│   ├── plans.ts                          — 티어 표시명 + 라이브러리 영상 수 라벨(단일 진실)
│   ├── onceGuard.ts · sendWelcomeOnce.ts — 웹훅 멱등성(claim/release) · 환영메일 1회 보장
│   ├── alertOps.ts                       — 실패 시 운영 알림 이메일 (webhook/결제/삭제)
│   ├── sanityWebhookAuth.ts              — /api/send/* Bearer 검증 (fail-closed)
│   ├── links.ts · scrollReturn.ts · ics.ts · videoProgress.ts · utils.ts
│   ├── emails/                           — 템플릿 (welcome, cancellation(-scheduled), plan-change,
│   │                                        webinar-invite, recording-notification,
│   │                                        annual-renewal-reminder, account-deletion, layout)
│   └── supabase/ client.ts · server.ts · admin.ts  — 브라우저 · 서버 · 서비스롤(관리자)
│
└── sanity/schemaTypes/                   — video · webinarRecording · webinarSchedule (index.ts 등록)
```

### 홈페이지 섹션 순서 (page.tsx 기준)
| # | 컴포넌트 | 목적 |
|---|----------|------|
| — | `AccountNotice` | 상단 알림 배너 (구독 상태 등) |
| 1 | `Hero` | 감정적 훅 — 슬라이드쇼 |
| 2 | `TrySession` | TAT for Animals 소개 + 영상 (끝에 About 링크) |
| 3 | `Testimonials` | 실제 후기 (사회적 증명) |
| 4 | `Pricing` | 멤버십 카드 + CTA |
| 5 | `RecordingTestimonials` | 오퍼 직후 안심 — 녹화에 반응한 동물 후기 |

> `Navbar` / `Footer`는 `layout.tsx`에서 전 페이지 공통. `AboutTapas`는 홈이 아닌 **`/about` 페이지**로 이동.

---

## 접근성 & 사용자층 원칙

TAT®의 핵심 사용자층은 **시니어 및 기술에 익숙하지 않은 사용자**입니다.
모든 UI/UX 결정은 이 기준을 우선으로 합니다.

### 최소 기준 — WCAG AA
- **색상 대비율**: 일반 텍스트 4.5:1 이상 / 대형 텍스트(18px bold 또는 24px) 3:1 이상
- **터치 타겟**: 최소 44×44px (버튼, 링크, 인터랙티브 요소 전체)
- **포커스 표시**: 키보드 탐색 시 포커스 링 항상 표시
- **움직임**: `prefers-reduced-motion` 미디어 쿼리 항상 고려

### 시니어 UX 가이드라인
- **폰트 크기**: 본문 최소 16px / 보조 텍스트 최소 14px / 장식용 대문자 트래킹 라벨(eyebrow)은 12px 허용 — **12px 미만은 어디에도 금지**
- **줄 간격**: 본문 `leading-relaxed` 이상 (1.625+)
- **한 번에 하나**: 한 화면에 하나의 주요 행동만. 선택지 최소화.
- **기술 용어 금지**: "Magic Link", "Dashboard" 같은 용어는 평문으로 대체
- **에러 메시지**: 빨간 텍스트 한 줄이 아닌 박스 형태 + 해결 방법 안내
- **로딩 상태**: 버튼 클릭 후 반드시 시각적 피드백 (스피너 또는 텍스트 변경)
- **"Cancel anytime"**: 구독 관련 모든 CTA 근처에 눈에 띄게 표시 (opacity 0.5 이상)
- **자동재생 금지**: 오디오/비디오 자동재생 금지. 배경 장식 영상만 예외 (음소거 필수).

---

## 코딩 규칙

### 색상 사용
- **메인 컬러**: 오렌지 (`#D4703A`) + 포레스트 그린 (`#467826`) — 두 가지 모두 (Footer 제외) 배경이 아닌 액센트로만 사용
- 섹션 배경은 항상 `bg-cream` 또는 `bg-white` — 그린은 배경으로 쓰지 않음 (단 Footer는 예외, 아래 참조)
- 그린 액센트: 섹션 라벨, 아이콘, 체크마크, 보더, 이탤릭 서브헤딩
- 오렌지 액센트: 버튼(CTA), 링크, 강조
- Footer만 예외: `backgroundColor: '#1E3310'` (딥 포레스트 그린 — 그린이 배경으로 쓰이는 유일한 곳, 포레스트 팔레트와 통일)
- rgba 그린 값: `rgba(70,120,38,...)` (#467826의 rgba 표현)
- 골드 강조색: `rgba(212,168,67,...)` (#D4A843의 rgba 표현)

### 폰트
- 헤딩+본문 모두 JUST Sans Regular 한 가지 (Bruce 선택, 로고와 통일감, 2026-08-16) — `font-serif`/`font-sans` 토큰 둘 다 같은 폰트로 매핑됨 (`src/app/layout.tsx`, `src/app/globals.css`)
- Regular 굵기만 로드됨 — `italic` 클래스는 진짜 이탤릭체가 아니라 브라우저가 만든 기울임(합성 이탤릭)으로 렌더링됨

### 다크 섹션 vs 라이트 섹션
| 섹션 | 배경 | 텍스트 |
|------|------|--------|
| 모든 섹션 (Hero, Pricing, TrySession 등) | `bg-cream` 또는 `bg-white` | `text-charcoal` |
| Membership Hero | `bg-cream` + 배경 이미지 + 하단 그라디언트 (홈 Hero와 동일 패턴, 다크 아님) | `text-charcoal` |
| Footer | `#1E3310` (딥 포레스트 그린) | `text-cream` |
| 그린/오렌지 사용처 | 배경 아님 — 라벨, 아이콘, 보더, 버튼 액센트 | — |

### 애니메이션 패턴
```tsx
// 스크롤 등장 — 표준 패턴
<motion.div
  initial={{ opacity: 0, y: 24 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
>
```

### 클라이언트 컴포넌트
- 이벤트 핸들러, useState, useEffect, Framer Motion 사용 시 파일 최상단에 `'use client'` 필수
- 인터랙션 없는 순수 표시 컴포넌트는 서버 컴포넌트로 유지 가능

---

## 미결 항목 (코드 작업 전 확인 필요)

**✅ 완료 (코드 반영됨)**
- 멤버십: The Calm Library ($27/mo · $270/yr) / The Calm Circle ($47/mo · $470/yr) — **연간 플랜 포함**
- Stripe + PayPal 결제 통합 (신규/업그레이드/취소, 카드·PayPal, 월·연)
- 이메일 자동화 (Resend) — 환영/취소/플랜변경/웨비나/갱신/삭제
- 계정 삭제 플로우 (이중 확인 + 실패 복구)
- 웹훅 하드닝 (멱등성 claim/release + 실패 롤백 + 운영 알림)
- **/about 페이지** — 구현 완료 (홈 About 링크 → 별도 페이지)
- **법률 페이지** — Privacy/Terms/Disclaimer Termageddon 임베드 완료
- **실제 후기** — Kai/Bowie/Misty 반영됨 (Testimonials)
- 시크릿 스캔 CI(gitleaks) + 테스트/빌드 CI 게이트, 보안 헤더, 실패 알림

**⚠️ 미완료 — 대부분 코드 밖(계정·설정·인프라)**
- **Vercel Production 환경변수 확인**: `NEXT_PUBLIC_SITE_URL`(도메인), `CRON_SECRET`, `OPS_ALERT_EMAIL`, 연간 가격/플랜 ID 4개, `SANITY_WEBHOOK_SECRET`
- PayPal Business 계정 활성 확인 (Jez)
- 도메인 연결 (tatforanimals.com — 현재 paused)
- Stripe Restricted API Key 발급 (프로덕션 전)
- 연간·PayPal 실거래 검증 → `docs/qa/annual-and-paypal-verification.md`

**🧹 남은 코드 정리 (선택, 런칭 전 권장)**
- CSP Report-Only → enforce 전환 (위반 관찰 후)
- (완료) 계정삭제 확인 GET→POST · Rate limiting(이메일·결제·문의 라우트, Supabase 기반)
- `review-feedback` 임시 도구 — 검수 재사용 가능성 있어 **유지**(런칭 시 정리 여부는 그때 판단)
