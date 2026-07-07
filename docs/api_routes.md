# API Routes

> 마지막 업데이트: 2026년 7월 6일

## 결제 — Stripe

| 라우트 | 메서드 | 목적 | 인증 |
|--------|--------|------|------|
| `/api/checkout` | POST | Stripe 체크아웃 세션 생성 (신규 구독, 월/연) | 필수 |
| `/api/checkout/verify` | POST | 리턴 시 구독 활성화 검증 (웹훅 지연/누락 폴백) | 필수 |
| `/api/change-plan` | POST | 업/다운그레이드 — Stripe `subscriptions.update`(즉시·프로레이션) 또는 다운그레이드 스케줄. `preview`로 청구 예상액 조회 | 필수 |
| `/api/portal` | POST | Stripe Customer Portal URL 반환 (결제수단/취소 관리) | 필수 |

**`/api/checkout` 안전장치:**
- 로컬 프로필에 `stripe_subscription_id`/`paypal_subscription_id` 있으면 400 (중복 구독 방지)
- 추가로 Stripe에 직접 `subscriptions.list`로 재확인 (웹훅 지연 중 이중 구독 차단)
- 이메일로 기존 Stripe customer 조회 후 재사용 (중복 customer 방지)
- `plan`은 월/연 4종 가격 맵에서 검증 (`calm_library` · `calm_circle` · `*_annual`)

**`/api/change-plan` 안전장치:**
- 연간 회원 · 자가 다운그레이드는 서버에서 차단(팀 처리 안내) — 월↔연 오전환/취소 상호작용 방지
- 이미 해당 티어면 no-op 거부

---

## 결제 — PayPal

| 라우트 | 메서드 | 목적 | 인증 |
|--------|--------|------|------|
| `/api/paypal/checkout` | POST | PayPal 구독 생성, approve URL 반환 (월/연) | 필수 |
| `/api/paypal/success` | GET | 승인 완료 처리, `/thank-you` 리다이렉트 | 불필요 (구독 상태 재조회) |
| `/api/paypal/cancel` | POST | PayPal 구독 취소 (기간 말까지 접근 유지) | 필수 |

**중복 결제 방지:** `paypal_pending_subscription_id` + `PayPal-Request-Id`(15분 버킷) 멱등 생성으로 승인/웹훅 지연 창의 이중 구독 차단.

---

## Webhook

| 라우트 | 메서드 | 목적 |
|--------|--------|------|
| `/api/webhooks/stripe` | POST | Stripe 이벤트 처리 |
| `/api/webhooks/paypal` | POST | PayPal 이벤트 처리 |

**공통 안전장치:**
- 멱등성: `onceGuard`(claimOnce/releaseOnce, `processed_webhook_events`) — 처리 실패 시 마커 롤백 → 프로바이더 재시도가 정상 재처리
- 서명 검증: Stripe `constructEvent()` / PayPal `verify-webhook-signature`
- 실패 시 `reportOpsError`로 운영 알림 이메일 발송(`lib/alertOps.ts`)

**Stripe 처리 이벤트:** `checkout.session.completed`(역할·환영메일) · `customer.subscription.updated`(업/다운그레이드 역할 동기화) · `customer.subscription.deleted`(→guest·취소메일) · `invoice.payment_succeeded`(active·기간갱신·업그레이드 확정메일) · `invoice.payment_failed`(→past_due)

**PayPal 처리 이벤트:** `BILLING.SUBSCRIPTION.ACTIVATED`(역할·환영) · `.UPDATED`(revise 업/다운그레이드) · `PAYMENT.SALE.COMPLETED`(갱신 역할 재동기화 — 지연 다운그레이드 반영) · `.PAYMENT.FAILED`(past_due) · `.CANCELLED`(기간말까지 유지) · `.EXPIRED`/`.CONSENT.REVOKED`(→guest)

> 역할 매핑(월·연)은 `lib/subscriptionAccess.ts`(Stripe) / `lib/paypal.ts`(PayPal)에 단일화.

---

## 이메일 자동화 (Sanity Webhook 트리거)

| 라우트 | 메서드 | 목적 | 트리거 |
|--------|--------|------|--------|
| `/api/send/webinar-invite` | POST | pro_subscriber에게 웨비나 초대 발송 | Sanity 웨비나 스케줄 발행 |
| `/api/send/recording-notification` | POST | pro_subscriber에게 녹화 알림 발송 | Sanity 녹화 발행 |

**인증:** `Authorization: Bearer <SANITY_WEBHOOK_SECRET>` — **fail-closed**(시크릿 미설정 시 거부) + 상수시간 비교 (`lib/sanityWebhookAuth.ts`).

---

## 인증 · 계정

| 라우트 | 메서드 | 목적 | 인증 |
|--------|--------|------|------|
| `/api/auth/logout` | POST | Supabase 세션 종료 | 세션 |
| `/auth/callback` | GET | 매직링크/OAuth 콜백. `next` 파라미터(오픈리다이렉트 방어) | 불필요 |
| `/api/request-account-deletion` | POST | 삭제 요청 — 확인 이메일(24h 토큰, `/confirm-account-deletion` 페이지 링크). 발송 실패 시 pending 롤백 | 필수 |
| `/api/confirm-account-deletion` | POST | 확인 페이지 버튼에서 호출 → 토큰 확인 → 구독 재검증 후 삭제, 실패 시 pending 복구·알림 | 토큰 |

> 이메일 링크는 **페이지**(`/confirm-account-deletion`)를 열고, 실제 삭제는 사용자의 명시적 **버튼 POST**로만 수행 — 메일 스캐너의 자동 GET 프리페치가 삭제를 트리거할 수 없음.

---

## 기타

| 라우트 | 메서드 | 목적 | 인증 |
|--------|--------|------|------|
| `/api/cron/annual-renewal-reminder` | GET | 연간 갱신 사전 고지 이메일 (캘리포니아 §17602) | `CRON_SECRET` (Vercel Cron) |
| `/api/contact` | POST | 문의 폼 → 이메일 (길이 제한·이메일 검증·HTML 이스케이프) | 불필요 |
| `/api/calendar/webinar` | GET | 웨비나 `.ics` 다운로드 | 불필요 |
| `/api/health` | GET | 라이브니스(업타임 모니터링용, 외부 의존 없음) | 불필요 |
| `/api/review-feedback` | POST | (임시) 검수 페이지 피드백 이메일 — 공개 토큰 게이트. 검수 재사용 위해 유지 | 토큰 |
