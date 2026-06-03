# 결제 시스템 · 계정 삭제 — 프로덕션 준비 점검 리포트

- **작업일**: 2026-06-03
- **브랜치**: `claude/git-merge-workflow-Nvugt`
- **범위**: 사이트에서 복잡도·중요도가 가장 높은 두 시스템 — **결제(Stripe + PayPal)** 와 **계정 삭제**
- **목표**: "즉시 실제 서비스 가능한 수준"으로 점검 → 문제 파악 → 수정 → 검증

---

## 요약 (TL;DR)

코드를 한 줄씩 정독하고, 설치된 Stripe v22 타입 정의와 테스트 실행으로 가설을 검증했습니다.
**"즉시 서비스 불가" 수준의 결함 5건**을 발견해 모두 수정했고, 회귀 테스트로 재발을 방지했습니다.

| # | 심각도 | 영역 | 한 줄 요약 | 상태 |
|---|--------|------|-----------|------|
| 1 | 🔴 P0 | 결제 | Stripe `current_period_end` 위치 변경 → 대시보드 결제일 항상 미표시 | ✅ 수정 |
| 2 | 🔴 P0 | 결제 | Stripe `invoice.subscription` 위치 변경 → 결제 실패가 `past_due`로 처리 안 됨 | ✅ 수정 |
| 3 | 🔴 P0 | 결제 | Webhook 멱등성이 일시적 오류 때 이벤트를 영구 손실 | ✅ 수정 |
| 4 | 🟠 P1 | 계정삭제 | 이메일 실패 시 사용자가 24시간 잠김 / 확인 단계 에러 미처리 / 유령 구독 | ✅ 수정 |
| 5 | 🟡 P2 | 테스트 | 테스트가 아예 실행 불가 + 결제 테스트 14개 중 13개 레드 | ✅ 수정 |

검증 결과: **결제·유틸 테스트 28개 전부 통과, 전체 타입 에러 0건.**

---

## 발견 및 수정 상세

### 1. 🔴 Stripe `current_period_end` — 다음 결제일이 항상 비어 있던 버그

**증상**
대시보드의 "Next charge(다음 결제일)"가 어떤 회원에게도 표시되지 않음.

**원인 (확인됨)**
코드는 Stripe API `2026-03-25.dahlia` 버전을 사용. 이 버전(2025-03-31 "basil" 릴리스 이후)에서
`current_period_end` 필드가 **`Subscription` 객체에서 제거**되고 각 **`SubscriptionItem`** 으로 이동함.

설치된 타입(`node_modules/stripe/cjs/resources/SubscriptionItems.d.ts:50`)에서 직접 확인:
```ts
current_period_end: number;   // ← 이제 여기에 있음
```
기존 코드는 `(subscription as any).current_period_end` 로 옛 위치를 읽어 런타임에 항상 `undefined`
→ DB에 항상 `null` 저장. `as any` 캐스팅 자체가 "타입에 더 이상 없는 필드"라는 증거였음.

**수정**
```ts
function getPeriodEndISO(subscription: Stripe.Subscription): string | null {
  const periodEnd = subscription.items.data[0]?.current_period_end
  return periodEnd ? new Date(periodEnd * 1000).toISOString() : null
}
```
`checkout.session.completed`, `invoice.payment_succeeded`, `customer.subscription.updated`
세 핸들러 모두 이 헬퍼를 사용하도록 통일.

---

### 2. 🔴 Stripe `invoice.subscription` — 결제 실패가 처리되지 않던 버그 (매출/접근 통제 구멍)

**증상**
카드 결제가 실패해도 회원 상태가 `past_due`로 바뀌지 않음 →
미납 회원이 콘텐츠에 계속 접근하고, "결제 수단을 업데이트하세요" 알림도 뜨지 않음.

**원인 (확인됨)**
같은 basil 릴리스에서 `Invoice.subscription` 필드가 제거되고
**`invoice.parent.subscription_details.subscription`** 로 이동함.
(`node_modules/stripe/cjs/resources/Invoices.d.ts` — `parent: Invoice.Parent | null`,
`subscription_details.subscription: string | Subscription`).

기존 코드 `(invoice as any).subscription` 는 `undefined` →
`invoice.payment_succeeded` / `invoice.payment_failed` 핸들러가 항상
`if (!subscriptionId) break` 에서 조기 종료 → 아무것도 갱신하지 못함.

**수정**
```ts
function getInvoiceSubscriptionId(invoice: Stripe.Invoice): string | null {
  const fromParent = invoice.parent?.subscription_details?.subscription
  if (typeof fromParent === 'string') return fromParent
  if (fromParent && typeof fromParent === 'object') return fromParent.id
  // 구버전 in-flight 이벤트 호환을 위한 폴백
  const legacy = (invoice as unknown as { subscription?: string | { id: string } }).subscription
  if (typeof legacy === 'string') return legacy
  if (legacy && typeof legacy === 'object') return legacy.id
  return null
}
```
신규 위치를 우선 읽고, 마이그레이션 중 남아있을 수 있는 구버전 이벤트도 폴백으로 처리.

---

### 3. 🔴 Webhook 멱등성 — 일시적 오류 시 결제 이벤트 영구 손실

**증상 (잠재)**
DB·Stripe 호출이 일시적으로 실패하면 해당 결제 이벤트가 다시는 처리되지 않음.

**원인**
기존 흐름:
```
processed_webhook_events 에 event.id INSERT  →  처리  →  실패 시 500 반환
```
처리 단계에서 예외가 나 500을 반환하면 Stripe가 자동 재시도하지만,
`event.id`는 이미 INSERT되어 있어 재시도는 23505(중복)로 "이미 처리됨" 판정 → **건너뜀**.
즉 한 번의 일시적 실패가 곧 영구 누락.

**수정** (Stripe · PayPal 두 webhook 동일)
```ts
} catch (error) {
  console.error('Webhook error:', error)
  // 실패 시 멱등성 마커를 롤백 → 재시도가 정상적으로 재처리하도록
  await supabaseAdmin.from('processed_webhook_events').delete().eq('id', event.id)
  return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
}
```
이 핸들러들은 이메일 발송을 자체 try/catch로 감싸고 있어, 롤백 후 재처리되어도
중복 이메일·중복 부작용이 발생하지 않음(부작용 유발 단계 이전에서만 예외 발생).

---

### 4. 🟠 계정 삭제 — 막다른 길 3종 제거

**4-1. 요청 단계: 이메일 실패 시 24시간 잠김**
기존에는 `pending` 레코드를 먼저 INSERT한 뒤 확인 이메일을 보냈는데, 이메일 발송이 실패해도
레코드가 남아 다음 시도가 "이미 진행 중" 가드에 막힘 → 24시간 동안 삭제 불가.
→ 이메일 발송을 try/catch로 감싸고, **실패 시 방금 만든 pending 레코드를 롤백**.

**4-2. 확인 단계: 에러 미처리로 영구 멈춤**
기존에는 `try/catch`가 전혀 없었고, 상태를 `completed`로 표시한 뒤 `deleteUser` 호출.
`deleteUser`가 실패하면 계정은 안 지워지고 상태만 `completed`로 남아 재시도 불가.
→ `deleteUser` 오류를 검사하고, **실패 시 상태를 `pending`으로 되돌려** 재시도 가능하게 함.

**4-3. 확인 시점 구독 재검증: 유령 구독 방지**
요청~확인 사이 24시간 동안 새로 구독하면, 구독이 살아있는 채로 계정만 삭제 →
Stripe에서 계속 청구되는 "유령 구독" 발생.
→ **확인 시점에 활성 구독을 재확인**하고, 있으면 삭제를 중단하고
`/dashboard?error=cancel-subscription-first` 로 안내.

---

### 5. 🟡 테스트 — 실행 불가에서 그린으로

**5-1. 테스트 하니스 복구**
`jest.config.ts` 의 `import nextJest from 'next/jest'` 가 Next 16(`exports` 맵 없음)에서
ESM 해석에 실패해 **전체 테스트가 실행 불가** 상태였음 → `'next/jest.js'` 로 수정.

**5-2. 결제 테스트 레드 → 그린**
멱등성 `.insert()` 코드가 추가됐으나 Supabase mock이 이를 지원하지 않아
**기존 결제 테스트 14개 중 13개가 실패**하고 있었음.
mock에 `insert`/`delete` 체인을 추가하고, 위 수정 사항을 잡아내는 **회귀 테스트 5개 추가**:
- `current_period_end`를 구독 아이템에서 읽는지
- 아이템에 기간 정보가 없으면 `null`로 떨어지는지
- 신규/구버전 invoice 페이로드 모두에서 구독 ID를 추출하는지
- 멱등성 23505 단락 처리
- 핸들러 예외 시 멱등성 마커 롤백

**5-3. 인증 UI 테스트 mock 드리프트 보정**
`LoginClient`/`SignupClient` 컴포넌트가 호출하는 `useSearchParams`, `router.replace`,
`supabase.auth.getUser` 가 테스트 mock에 빠져 있던 것을 보강 (실패 27건 → 10건으로 감소).

---

## 검증 결과

```
결제 webhook 테스트:  19개 전부 통과
유틸 테스트:           9개 전부 통과
─────────────────────────────────
in-scope 합계:        28개 전부 통과

타입체크(tsc --noEmit): 전체 코드베이스 에러 0건
```

---

## 변경 파일

| 파일 | 내용 |
|------|------|
| `src/app/api/webhooks/stripe/route.ts` | 필드 위치 헬퍼 2종 + 멱등성 롤백 |
| `src/app/api/webhooks/paypal/route.ts` | 멱등성 롤백 |
| `src/app/api/request-account-deletion/route.ts` | 이메일 실패 시 pending 롤백 |
| `src/app/api/confirm-account-deletion/route.ts` | 에러 처리 + 구독 재검증 + 상태 복구 |
| `src/__tests__/stripe-webhook.test.ts` | mock 보강 + 회귀 테스트 5종 |
| `src/__tests__/LoginClient.test.tsx`, `SignupClient.test.tsx` | mock 드리프트 보정 |
| `jest.config.ts` | Next 16 호환(`next/jest.js`) |

---

## 남은 사항 / 후속 권장

1. **로그인/회원가입 UI 테스트 10건 실패 (범위 밖)**
   로그인 화면이 재디자인됐는데(예: 제목 "Welcome back" → "Sign in to your account")
   테스트가 옛 문구·옛 인터랙션을 검사하는 **사전 드리프트**. UX 의도를 추측해 고치는 것은
   위험하므로 이번 작업에서는 손대지 않음. 별도 패스로 현재 UI에 맞춰 정리 권장.

2. **DB 스키마 전제**
   `account_deletion_requests`, `processed_webhook_events`, `profiles.current_period_end`
   컬럼이 이미 존재한다는 전제로 작업(코드 전반에서 사용 중). 마이그레이션 변경 없음.

3. **프로덕션 배포 전 환경 변수 확인**
   `STRIPE_WEBHOOK_SECRET`, `PAYPAL_WEBHOOK_ID`, `STRIPE_PRICE_*`, `PAYPAL_PLAN_*`,
   `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY` 등 실제 프로덕션 값 주입 여부 점검.

4. **실거래 스모크 테스트 권장**
   Stripe 테스트 모드에서 (1) 신규 결제 → 결제일 표시, (2) 결제 실패 → `past_due` 전환,
   (3) 취소 → guest 강등, (4) 계정 삭제 전체 플로우를 1회씩 수동 확인 권장.
