# API Routes

> 마지막 업데이트: 2026년 6월 1일

## 결제 — Stripe

| 라우트 | 메서드 | 목적 | 인증 |
|--------|--------|------|------|
| `/api/checkout` | POST | Stripe 체크아웃 세션 생성 (신규 구독) | 필수 |
| `/api/portal` | POST | Stripe Customer Portal URL 반환 (구독 관리/취소) | 필수 |
| `/api/upgrade` | POST | Stripe Portal `subscription_update_confirm` URL 반환 (basic → pro 업그레이드) | 필수 |

**`/api/checkout` 안전장치:**
- `stripe_subscription_id` 또는 `paypal_subscription_id` 있으면 400 반환 (중복 구독 방지)
- 이메일로 기존 Stripe customer 조회 후 재사용 (중복 customer 방지)
- 환경변수(`STRIPE_PRICE_CALM_LIBRARY`, `STRIPE_PRICE_CALM_CIRCLE`) 누락 시 즉시 에러

---

## 결제 — PayPal

| 라우트 | 메서드 | 목적 | 인증 |
|--------|--------|------|------|
| `/api/paypal/checkout` | POST | PayPal 구독 생성, approve URL 반환 | 필수 |
| `/api/paypal/success` | GET | PayPal 승인 완료 후 처리, `/thank-you` 리다이렉트 | 불필요 |

---

## Webhook

| 라우트 | 메서드 | 목적 |
|--------|--------|------|
| `/api/webhooks/stripe` | POST | Stripe 이벤트 처리 (구독 생성/업데이트/취소/결제 실패) |
| `/api/webhooks/paypal` | POST | PayPal 이벤트 처리 (구독 활성화/취소/결제 실패) |

**공통 안전장치:**
- Idempotency: `processed_webhook_events` 테이블로 중복 처리 방지 (INSERT conflict 23505)
- Stripe: `stripe.webhooks.constructEvent()`로 서명 검증
- PayPal: PayPal API `/v1/notifications/verify-webhook-signature`로 서명 검증

**Stripe 처리 이벤트:**

| 이벤트 | 처리 |
|--------|------|
| `checkout.session.completed` | role 설정, stripe_subscription_id 저장, 환영 이메일 |
| `customer.subscription.updated` | 업그레이드/다운그레이드 role 동기화 |
| `customer.subscription.deleted` | role → guest, 구독 ID 초기화, 취소 이메일 |
| `invoice.payment_succeeded` | subscription_status → active, current_period_end 업데이트 |
| `invoice.payment_failed` | subscription_status → past_due |

**PayPal 처리 이벤트:**

| 이벤트 | 처리 |
|--------|------|
| `BILLING.SUBSCRIPTION.ACTIVATED` | role 설정, paypal_subscription_id 저장 |
| `PAYMENT.SALE.COMPLETED` | subscription_status → active |
| `BILLING.SUBSCRIPTION.PAYMENT.FAILED` | subscription_status → past_due |
| `BILLING.SUBSCRIPTION.CANCELLED` | role → guest |
| `BILLING.SUBSCRIPTION.EXPIRED` | role → guest |
| `BILLING.SUBSCRIPTION.CONSENT.REVOKED` | role → guest |

---

## 이메일 자동화 (Sanity Webhook 트리거)

| 라우트 | 메서드 | 목적 | 트리거 |
|--------|--------|------|--------|
| `/api/send/webinar-invite` | POST | pro_subscriber에게 웨비나 초대 이메일 발송 | Sanity 웨비나 스케줄 생성 시 |
| `/api/send/recording-notification` | POST | pro_subscriber에게 녹화 알림 이메일 발송 | Sanity 웨비나 녹화 발행 시 |

---

## 인증

| 라우트 | 메서드 | 목적 |
|--------|--------|------|
| `/api/auth/logout` | POST | Supabase 세션 종료 |
| `/auth/callback` | GET | Supabase OAuth/Magic Link 콜백. `next` 파라미터로 리다이렉트. 기본: `/membership` |

---

## 계정 관리

| 라우트 | 메서드 | 목적 | 인증 |
|--------|--------|------|------|
| `/api/request-account-deletion` | POST | 계정 삭제 요청 — 확인 이메일 발송 (24시간 유효 토큰) | 필수 |
| `/api/confirm-account-deletion` | GET | 이메일 링크 클릭 시 계정 즉시 삭제, `/` 리다이렉트 | 불필요 (토큰 검증) |
