# Database Schema (Supabase)

> 마지막 업데이트: 2026년 6월 1일

---

## profiles

Supabase `auth.users` 확장. 사용자 데이터 + 구독 상태.

| 컬럼 | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `id` | uuid | — | PK, `auth.users(id)` 참조 |
| `email` | text | — | |
| `full_name` | text | — | Stripe 결제 완료 시 수집 |
| `avatar_url` | text | — | |
| `role` | text | `'guest'` | `guest` / `subscriber` / `pro_subscriber` |
| `stripe_customer_id` | text | — | UNIQUE |
| `stripe_subscription_id` | text | — | |
| `paypal_subscription_id` | text | — | UNIQUE |
| `subscription_status` | text | `'inactive'` | `active` / `past_due` / `inactive` |
| `current_period_end` | timestamptz | — | 다음 갱신일 |
| `created_at` | timestamptz | `now()` | |
| `updated_at` | timestamptz | `now()` | 자동 갱신 트리거 |

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

**사용법:** Webhook 수신 시 `INSERT` 시도 → conflict(23505)이면 이미 처리된 이벤트 → 즉시 return

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

## Migration 파일 목록

| 파일 | 내용 |
|------|------|
| `20260415_profiles.sql` | profiles 테이블 + RLS + 트리거 |
| `20260415_profiles_stripe.sql` | stripe_customer_id, stripe_subscription_id, subscription_status 추가 |
| `20260531_processed_webhook_events.sql` | processed_webhook_events 테이블 |
| `20260531_profiles_paypal_and_deletion.sql` | paypal_subscription_id, current_period_end, account_deletion_requests 테이블 |
| `20260531_account_deletion_token.sql` | account_deletion_requests에 token, expires_at 컬럼 추가 |
| `20260626_video_watch_events.sql` | video_watch_events 테이블 (실제 프로덕션 스키마 문서화, 멱등) |

> 참고: 위 목록은 일부만 기재돼 있을 수 있음 — 전체는 `supabase/migrations/` 디렉터리 확인.
