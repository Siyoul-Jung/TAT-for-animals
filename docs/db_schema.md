# Database Schema (Supabase)

> 마지막 업데이트: 2026년 7월 6일

---

## profiles

Supabase `auth.users` 확장. 사용자 데이터 + 구독 상태.

| 컬럼 | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `id` | uuid | — | PK, `auth.users(id)` 참조 |
| `email` | text | — | |
| `full_name` | text | — | Stripe 결제 완료 시 수집 |
| `avatar_url` | text | — | |
| `role` | text | `'guest'` | `guest` / `subscriber` / `pro_subscriber` — **CHECK 제약** |
| `stripe_customer_id` | text | — | UNIQUE |
| `stripe_subscription_id` | text | — | |
| `paypal_subscription_id` | text | — | UNIQUE |
| `paypal_pending_subscription_id` | text | — | 승인 전 PayPal 구독(중복 결제 방지) |
| `subscription_status` | text | `'inactive'` | `active` / `past_due` / `inactive` — **CHECK 제약** |
| `current_period_end` | timestamptz | — | 다음 갱신일 |
| `billing_interval` | text | — | `month` / `year` (대시보드 표기), NULL=`month` 간주 |
| `pending_tier` | text | — | 예약된 전환 목표 등급 (다운그레이드 등), NULL=예약 없음 |
| `pending_tier_at` | timestamptz | — | 전환 시점(= 다음 결제일) |
| `cancel_at` | timestamptz | — | 취소 예정일(그때까지 접근 유지) |
| `created_at` | timestamptz | `now()` | |
| `updated_at` | timestamptz | `now()` | 자동 갱신 트리거 |

> ℹ️ **`billing_interval`**: 코드(웹훅·대시보드)가 읽고 쓰는 표기용 컬럼. 한동안 생성 마이그레이션이 없었으나(프로덕션엔 수동 추가돼 동작) `20260706_profiles_billing_interval.sql`(멱등)로 갭을 닫음 — 이제 새 환경도 마이그레이션만으로 재현 가능.

**RLS 정책:**
- `본인 읽기`: `auth.uid() = id`
- `본인 수정`: `auth.uid() = id`
- Service role (webhook): RLS bypass

**인덱스:**
- `profiles_stripe_customer_id_idx`
- `profiles_paypal_subscription_id_idx`

**트리거:**
- `on_auth_user_created`: 가입 시 자동으로 profiles row 생성
- `profiles_updated_at`: update 시 `updated_at` 자동 갱신

---

## account_deletion_requests

계정 삭제 요청 기록.

| 컬럼 | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `id` | uuid | `gen_random_uuid()` | PK |
| `user_id` | uuid | — | `auth.users(id)` 참조 (ON DELETE CASCADE) |
| `token` | text | — | UNIQUE, 이메일 확인 링크 토큰 |
| `expires_at` | timestamptz | — | 24시간 유효 |
| `status` | text | `'pending'` | `pending` / `completed` |
| `requested_at` | timestamptz | — | |
| `created_at` | timestamptz | `now()` | |

**RLS 정책:**
- `본인 읽기`: `auth.uid() = user_id`
- 삽입/수정: service role만 (API 라우트)

---

## processed_webhook_events

Webhook idempotency 보장.

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `id` | text | PK — Stripe/PayPal 이벤트 ID |
| `processed_at` | timestamptz | |

**사용법:** `lib/onceGuard.ts`의 `claimOnce(id)`가 INSERT 시도 → conflict(23505)이면 이미 처리됨 → 스킵. 처리 중 실패하면 `releaseOnce(id)`로 마커를 롤백해 프로바이더 재시도가 정상 재처리(멱등 + 실패 복구). 웹훅 외에 일부 1회성 가드(연간 갱신 알림 등)도 이 테이블을 공유.

**RLS:** 활성화 (service role만 접근)

---

## video_watch_events *(구현됨 — 라이브러리 진행률)*

영상 시청 진행률. 라이브러리의 진행바·체크 아이콘 표시에 사용. `src/lib/videoProgress.ts`가 `(user_id, content_id)` UNIQUE로 upsert.

| 컬럼 | 타입 | 제약 / 기본값 | 설명 |
|------|------|------|------|
| `id` | uuid | PK, default `gen_random_uuid()` | |
| `user_id` | uuid | NOT NULL, FK profiles(id) ON DELETE CASCADE | |
| `content_id` | text | NOT NULL | Sanity 문서 ID |
| `content_type` | text | **NOT NULL, default 없음**, CHECK `video`/`webinar` | ⚠️ 코드가 반드시 보내야 함 (안 보내면 저장 실패) |
| `watched_at` | timestamptz | NOT NULL, default `now()` | |
| `watch_duration` | integer | | 초 단위 |
| `completed` | boolean | default `false` | 완료 여부 |
| `last_position` | integer | default `0` | 이어보기 위치(초) |
| `updated_at` | timestamptz | default `now()` | |

- UNIQUE `(user_id, content_id)` — upsert `onConflict` 대상
- RLS 활성, 본인 행만 접근(`auth.uid() = user_id`)
- ⚠️ 프로덕션엔 이미 존재하나 마이그레이션이 없었음 → `20260626_video_watch_events.sql`로 실제 스키마 문서화(멱등, 재실행 안전)

---

## rate_limits

API 남용 방지용 고정 윈도우 카운터. 전 서버리스 인스턴스가 공유. `lib/rateLimit.ts`가 `check_rate_limit(key, limit, window_seconds)` 함수(원자적 upsert)를 호출.

| 컬럼 | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `key` | text | — | PK — `"<scope>:<user_id|ip>"` |
| `count` | integer | `0` | 현재 윈도우 내 호출 수 |
| `window_start` | timestamptz | `now()` | 윈도우 시작 시각 (만료 시 in-place 리셋) |

**RLS:** 활성(정책 없음) → service role만 접근. **함수:** `check_rate_limit` → 허용 시 `true` 반환.

---

## Migration 파일 목록

| 파일 | 내용 |
|------|------|
| `20260415_profiles.sql` | profiles 테이블 + RLS + 트리거 |
| `20260415_profiles_stripe.sql` | stripe_customer_id, stripe_subscription_id, subscription_status 추가 |
| `20260531_processed_webhook_events.sql` | processed_webhook_events 테이블 |
| `20260531_profiles_paypal_and_deletion.sql` | paypal_subscription_id, current_period_end, account_deletion_requests 테이블 |
| `20260531_account_deletion_token.sql` | account_deletion_requests에 token, expires_at 컬럼 추가 |
| `20260602_profiles_role_check.sql` | profiles.role CHECK 제약 |
| `20260602_webhook_events_rls_and_dedup_indexes.sql` | processed_webhook_events RLS + 중복 인덱스 정리 |
| `20260603_profiles_subscription_status_check.sql` | profiles.subscription_status CHECK 제약 |
| `20260608_profiles_pending_tier.sql` | pending_tier, pending_tier_at 추가 (지연 다운그레이드) |
| `20260609_profiles_cancel_at.sql` | cancel_at 추가 (취소 예정일까지 접근 유지) |
| `20260626_video_watch_events.sql` | video_watch_events 테이블 (실제 프로덕션 스키마 문서화, 멱등) |
| `20260630_profiles_paypal_pending_subscription.sql` | paypal_pending_subscription_id 추가 (PayPal 중복 결제 방지) |
| `20260706_profiles_billing_interval.sql` | billing_interval 추가 (누락 갭 보완, 멱등) |
| `20260706_rate_limits.sql` | rate_limits 테이블 + check_rate_limit 함수 (API 남용 방지) |

> 참고: 전체 목록은 항상 `supabase/migrations/` 디렉터리를 확인.
