# 결제 검증 체크리스트 — 연간 플랜 & PayPal

Jez의 Function review(2026-07-02)에서 **PayPal 결제**와 **연간 플랜**은 `[-]`(미테스트)로 남았습니다.
코드 점검 결과 **로직은 전 계층에서 올바르게 연결**돼 있으나(회귀 테스트 `src/__tests__/annual-billing.test.ts`로 고정), 코드만으로는 확인할 수 없는 **설정·계정·실거래** 부분이 남아 있어 이 문서로 검증합니다.

> 안전 원칙: 반드시 **Stripe 테스트 모드 + PayPal 샌드박스**에서 먼저 통과시킨 뒤 프로덕션으로. 실제 카드/실제 돈으로 첫 테스트하지 말 것.

---

## 0. 사전 설정 확인 (여기서 막히면 결제가 아예 안 됨)

### 0-1. Vercel Production 환경 변수 (4개 연간 + PayPal 자격증명)
- [ ] `STRIPE_PRICE_CALM_LIBRARY_ANNUAL` = 실제 Stripe **연간** 가격 ID (`price_…`)
- [ ] `STRIPE_PRICE_CALM_CIRCLE_ANNUAL` = 실제 Stripe **연간** 가격 ID
- [ ] `PAYPAL_PLAN_CALM_LIBRARY_ANNUAL` = 실제 PayPal **연간** 플랜 ID (`P-…`)
- [ ] `PAYPAL_PLAN_CALM_CIRCLE_ANNUAL` = 실제 PayPal **연간** 플랜 ID
- [ ] `NEXT_PUBLIC_PAYPAL_CLIENT_ID` / `PAYPAL_CLIENT_SECRET` / `PAYPAL_WEBHOOK_ID` 설정됨
- [ ] `PAYPAL_ENV` — 테스트 시 `sandbox`, 실서비스 시 미설정(=live)

> 하나라도 비어 있으면: 연간 결제는 **"Invalid plan"**(env 없는 가격), PayPal은 **전체 실패**.

### 0-2. Stripe / PayPal 대시보드에 상품이 실제 존재
- [ ] Stripe: The Calm Library / The Calm Circle 각각에 **연 1회(yearly) 가격**이 생성돼 있음 (월 ×10 = $270 / $470)
- [ ] PayPal: 각 티어에 **YEAR 주기 플랜**이 생성돼 있음
- [ ] **PayPal Business 계정이 활성** (CLAUDE.md의 "Jez 확인 중" 항목) — 미완이면 PayPal 월·연 모두 불가

### 0-3. Webhook 엔드포인트 등록
- [ ] Stripe webhook → `/api/webhooks/stripe` (서명 시크릿 = `STRIPE_WEBHOOK_SECRET`)
- [ ] PayPal webhook → `/api/webhooks/paypal` (`PAYPAL_WEBHOOK_ID` 일치)

---

## 1. 카드 · 연간 (Stripe 테스트 모드)

플랜: **The Calm Circle 연간** (가장 위험 — 상위 티어 + 연간)

- [ ] `/membership`에서 상단 토글을 **Yearly**로 전환 → 가격이 `$470`, "≈ $39.17/mo · Save $94"로 표시
- [ ] Calm Circle "Join" → `/checkout?plan=calm_circle_annual` 로 이동 (URL에 `_annual` 확인)
- [ ] 체크아웃 화면에 **연간 가격 + "Billed yearly"** 문구 표시
- [ ] 카드로 결제 (테스트 카드 `4242 4242 4242 4242`)
- [ ] `/thank-you`로 이동
- [ ] **대시보드**: 등급 = **The Calm Circle**, 상태 = Active, 표기 = **"$47 / month"가 아닌 연간**, **Next charge = 약 1년 뒤**
- [ ] **Live Webinars 탭 접근 가능** (pro 전용 → 연간 pro도 열려야 함)
- [ ] 환영 이메일 수신
- [ ] Supabase `profiles`: `role=pro_subscriber`, `subscription_status=active`, `current_period_end`≈+1년

> ❗ 여기서 등급이 `subscriber`(하위)로 뜨면 → 연간 가격 ID가 `PRICE_ROLE_MAP`에 없거나 env 오설정. (코드는 정상이므로 십중팔구 **0-1 env 문제**)

- [ ] (반복) **Calm Library 연간**으로도 1회 — 등급 = subscriber, 연간 표기 확인

---

## 2. PayPal · 월간 (샌드박스)

- [ ] `/membership` 토글 **Monthly**, Calm Library 또는 Circle 선택 → `/checkout`
- [ ] 체크아웃에서 **PayPal** 선택 → PayPal 승인 화면으로 이동 (승인 URL 정상 발급)
- [ ] 샌드박스 구매자 계정으로 승인
- [ ] `/thank-you`로 복귀
- [ ] 대시보드: 등급/상태 정확, 표기 = **월간**, Next charge ≈ +1개월
- [ ] `profiles`: `paypal_subscription_id` 채워짐, `paypal_pending_subscription_id` = null(활성화 시 정리됨)
- [ ] PayPal webhook `BILLING.SUBSCRIPTION.ACTIVATED` 수신 로그 확인

---

## 3. PayPal · 연간 (샌드박스)

- [ ] 토글 **Yearly**, Calm Circle 선택 → `/checkout?plan=calm_circle_annual`
- [ ] PayPal 선택 → 승인 → `/thank-you`
- [ ] 대시보드: 등급 = **pro_subscriber**, 표기 = **연간**, Next charge ≈ +1년
- [ ] `profiles`: role/interval 정확
- [ ] (반복) Calm Library 연간도 1회

---

## 4. 중복 결제 방지 (연간에서도 동작하는지)

- [ ] 이미 구독 중인 상태에서 `/checkout?plan=…_annual` 재접근 → **"already have an active subscription"** 로 차단
- [ ] PayPal 승인 도중 이탈 후 재시도 → **같은 승인 페이지**로 복귀(중복 구독 미생성)

---

## 5. 문제 발생 시 확인 순서

1. **브라우저**: `/checkout`에서 "Invalid plan" → 0-1 env(연간 ID) 누락
2. **결제 실패(PayPal)**: 승인 URL 미발급 → PayPal 자격증명/Business 계정(0-1, 0-2)
3. **결제됐는데 등급 안 바뀜**: webhook 미수신(0-3) 또는 서명 불일치 → Stripe/PayPal webhook 로그 + `processed_webhook_events` 테이블
4. **등급이 하위로 잘못 부여**: 연간 가격/플랜 ID가 역할 맵에 없음 → env 값이 실제 대시보드 ID와 일치하는지 (코드 로직은 회귀 테스트로 검증됨)

---

## 검증 완료 기준

- [ ] 위 1~4 전부 통과 (테스트/샌드박스)
- [ ] 동일 항목을 **프로덕션에서 소액 실거래 1회씩**(가능하면) 또는 최소한 0장 설정 재확인
- [ ] Jez에게 PayPal·연간 통과 공유 → Function review의 `[-]` 4항목 중 결제 2건 종료

> 코드 레벨은 이미 통과(초록). 이 체크리스트는 **설정·계정·실거래** 층을 닫기 위한 것입니다.
