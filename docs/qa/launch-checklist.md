# 런칭 배포 체크리스트

> Supabase / Vercel / Stripe / PayPal **대시보드 작업**입니다(코드 밖). 하나씩 체크하며 진행하세요.
> 코드에서 자동 추출·검증한 목록이라 **누락 없이** 되어 있습니다.

---

## 1. 마이그레이션 적용 (Supabase)

프로덕션 DB에 아직 적용 안 된 마이그레이션을 실행합니다. **둘 다 멱등(idempotent)** — 이미 있으면 무동작, 재실행해도 안전합니다.

| 파일 | 내용 | 왜 필요 |
|------|------|---------|
| `supabase/migrations/20260706_profiles_billing_interval.sql` | `profiles.billing_interval` 컬럼 | ✅ **프로덕션 확인 완료(2026-07-08)** — 컬럼 이미 존재. 기록/재현용 |
| `supabase/migrations/20260706_rate_limits.sql` | `rate_limits` 테이블 + `check_rate_limit()` 함수 | ✅ **프로덕션 적용 완료(2026-07-08)** — 함수 동작·RLS 검증됨 |
| `supabase/migrations/20260708_profiles_billing_interval_check.sql` | `billing_interval` CHECK 제약 (month/year/NULL) | 신규 — role/status와 동일한 값 집합 고정. 멱등 |
| `supabase/migrations/20260715_profiles_lock_privileged_columns.sql` | `profiles` UPDATE 컬럼 잠금 (role/구독 컬럼 self-grant 차단) | 🔴 **P0 보안 — 반드시 적용.** 미적용 시 로그인 유저가 자기 role을 pro로 바꿔 **유료 우회** 가능. 멱등 |

**적용 방법 (둘 중 하나):**

- **A. Supabase CLI** (권장, 마이그레이션 추적)
  ```bash
  supabase db push          # 미적용 마이그레이션 자동 적용
  # 또는 supabase migration up
  ```
- **B. Supabase 대시보드** (수동)
  1. 프로젝트 → **SQL Editor**
  2. 위 두 파일 내용을 각각 붙여넣고 **Run**
  3. 완료 후 `Table Editor`에서 `rate_limits` 테이블이 보이는지 확인

- [x] `billing_interval` 마이그레이션 적용 (컬럼 존재 확인, 2026-07-08)
- [x] `rate_limits` 마이그레이션 적용 (2026-07-08)
- [x] `rate_limits` 테이블 + `check_rate_limit` 함수 생성 확인 (2026-07-08)
- [ ] `billing_interval` CHECK 제약 마이그레이션 적용 (20260708)
- [ ] 🔴 **`profiles` 권한 잠금 마이그레이션 적용 (20260715) — P0 보안, 필수**
- [ ] (적용 후 검증) 무료 계정 콘솔에서 `.from('profiles').update({role:'pro_subscriber'})` → **"permission denied for column role"** 확인

> 참고: 그 외 오래된 마이그레이션들은 사이트가 이미 동작 중이므로 적용된 상태로 간주됩니다. CLI(`db push`)를 쓰면 안전하게 미적용분만 반영됩니다.

---

## 2. Vercel Production 환경변수 확인

Vercel → 프로젝트 → **Settings → Environment Variables → Production** 에서 아래를 **전부** 확인/설정하세요.
(코드가 실제 사용하는 변수 전량. `노출` = 브라우저에 노출되므로 비밀 아님 / `🔒` = 서버 전용 비밀)

### Supabase
| 변수 | 무엇 / 어디서 | 노출 |
|------|--------------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL (Settings→API) | 노출 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon public 키 | 노출 |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role 키 (webhook·admin, RLS bypass) | 🔒 |

### Stripe
| 변수 | 무엇 / 어디서 | 노출 |
|------|--------------|------|
| `STRIPE_SECRET_KEY` | Secret key (프로덕션은 **Restricted key** 권장) | 🔒 |
| `STRIPE_WEBHOOK_SECRET` | Webhook 서명 시크릿 (Developers→Webhooks, 엔드포인트 `/api/webhooks/stripe`) | 🔒 |
| `STRIPE_PRICE_CALM_LIBRARY` | 월간 Library 가격 ID (`price_…`) | 🔒 |
| `STRIPE_PRICE_CALM_CIRCLE` | 월간 Circle 가격 ID | 🔒 |
| `STRIPE_PRICE_CALM_LIBRARY_ANNUAL` | **연간** Library 가격 ID | 🔒 |
| `STRIPE_PRICE_CALM_CIRCLE_ANNUAL` | **연간** Circle 가격 ID | 🔒 |
| `STRIPE_PORTAL_MANAGE_CONFIG_ID` | (선택) 취소·결제수단 전용 포털 구성 ID | 🔒 |
| `STRIPE_PORTAL_CONFIG_ID` | (선택) 범용 포털 구성 ID | 🔒 |

### PayPal
| 변수 | 무엇 / 어디서 | 노출 |
|------|--------------|------|
| `PAYPAL_ENV` | 프로덕션은 **비워두기**(=live). `sandbox`면 테스트 모드 | 🔒 |
| `NEXT_PUBLIC_PAYPAL_CLIENT_ID` | 앱 Client ID | 노출 |
| `PAYPAL_CLIENT_SECRET` | 앱 Secret | 🔒 |
| `PAYPAL_WEBHOOK_ID` | Webhook ID (엔드포인트 `/api/webhooks/paypal`) | 🔒 |
| `PAYPAL_PLAN_CALM_LIBRARY` | 월간 Library 플랜 ID (`P-…`) | 🔒 |
| `PAYPAL_PLAN_CALM_CIRCLE` | 월간 Circle 플랜 ID | 🔒 |
| `PAYPAL_PLAN_CALM_LIBRARY_ANNUAL` | **연간** Library 플랜 ID | 🔒 |
| `PAYPAL_PLAN_CALM_CIRCLE_ANNUAL` | **연간** Circle 플랜 ID | 🔒 |

### Sanity
| 변수 | 무엇 / 어디서 | 노출 |
|------|--------------|------|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Sanity 프로젝트 ID | 노출 |
| `NEXT_PUBLIC_SANITY_DATASET` | 보통 `production` | 노출 |
| `SANITY_WEBHOOK_SECRET` | `/api/send/*` Bearer 인증. **미설정 시 웨비나/녹화 알림 발송 거부**(fail-closed) | 🔒 |
| `SANITY_API_TOKEN` | (Studio 쓰기용, 사용 시) | 🔒 |

### 이메일 · 앱 · 크론
| 변수 | 무엇 / 어디서 | 노출 |
|------|--------------|------|
| `RESEND_API_KEY` | Resend API 키 (모든 이메일 발송) | 🔒 |
| `OPS_ALERT_EMAIL` | 실패 알림 수신 주소 (미설정 시 사이트 오너로 발송) | 🔒 |
| `NEXT_PUBLIC_SITE_URL` | **프로덕션 도메인** (예 `https://tatforanimals.com`). 모든 결제 리다이렉트·이메일 링크·로고가 의존 | 노출 |
| `CRON_SECRET` | Vercel Cron 인증. **미설정 시 연간 갱신 사전고지 메일이 조용히 안 나감**(법정 고지) | 🔒 |

**체크 요령:**
- [ ] 위 변수가 **Production 환경**에 전부 존재 (Preview에도 필요하면 별도 체크)
- [ ] **연간 4개**(`*_ANNUAL`)와 **PayPal 4개 플랜**이 실제 Stripe/PayPal에 생성된 ID를 가리키는지
- [ ] `NEXT_PUBLIC_SITE_URL`이 **실제 라이브 도메인**인지 (리다이렉트·이메일·로고 전부 여기 의존)
- [ ] `PAYPAL_ENV`가 프로덕션에서 **live**인지 (sandbox 아님)

---

## 3. 런칭 당일 전환 순서 (도메인 연결하는 날 위에서부터 차례로)

1. [ ] **tatforanimals.com 재개 + Vercel 도메인 연결**
2. [ ] `NEXT_PUBLIC_SITE_URL` → `https://tatforanimals.com` (결제 리다이렉트·이메일 링크·sitemap 전부 의존)
3. [ ] **Supabase Auth → URL Configuration**에 새 도메인 추가 (Site URL + Redirect URLs) — 빠지면 이메일 인증/로그인 링크가 새 도메인에서 깨짐
4. [ ] **실가 전환**: Stripe 가격 ID 4개 교체 + PayPal 실가 플랜 4개 생성·ID 교체 (QA $0.50/$1 → $27/$47/$270/$470)
5. [ ] **Sanity 웹훅 URL 2개** → tatforanimals.com으로 되돌리기 (manage.sanity.io → API → Webhooks, 현재 .vercel.app 임시)
6. [ ] **`layout.tsx`의 `robots: { index: false }` 줄 삭제** — 안 지우면 구글에 영원히 안 뜸 (주석에 표시돼 있음)
7. [ ] **CSP Report-Only → 차단 모드** 전환 커밋 (`next.config.ts`, 위반 로그 깨끗한 것 확인됨 2026-07-09)
8. [ ] 배포 후 **스모크 테스트**: 가입 → 이메일 인증 → 결제(카드·PayPal 각 1건, 실가) → 라이브러리 재생 → 환영 메일 도착
9. [ ] **Google Search Console** 등록 + sitemap.xml 제출

## 4. 그 외 (참고 — 별도 항목)
- PayPal Business 계정 활성 · Stripe Restricted Key 사용 여부 확인(현재 키가 전체 권한이면 제한 키로 교체)
- 연간·PayPal 실거래 검증 → `docs/qa/annual-and-paypal-verification.md` (8번 스모크와 병합 가능)
- 업타임 모니터(UptimeRobot 등)에 `https://tatforanimals.com/api/health` 등록 (5분 간격, 이메일 알림)
- Vercel Analytics 활성화 (대시보드 토글 — 코드는 이미 들어감)
- Supabase 백업 정책 확인 (플랜별 보존 기간 — 결제·회원 데이터)
