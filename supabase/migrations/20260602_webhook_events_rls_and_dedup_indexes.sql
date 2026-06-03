-- ============================================================
-- 안전한 정리 (데이터 변경 없음 · 되돌리기 쉬움)
--
-- 1) processed_webhook_events에 RLS(행 수준 보안) 활성화
--    이 테이블은 웹훅(service_role)만 사용한다. Supabase는 public 스키마
--    테이블을 API로 노출하므로, RLS가 없으면 anon 키로 읽힐 수 있다.
--    정책(policy)을 하나도 만들지 않음 = service_role 외 전부 차단
--    (service_role은 RLS를 통과하므로 웹훅은 정상 동작).
--
-- 2) 중복 인덱스 제거
--    stripe_customer_id / paypal_subscription_id 컬럼은 UNIQUE 제약이
--    이미 인덱스를 자동 생성한다. 아래 명시 인덱스는 그와 중복이므로 제거.
--    조회 속도 영향 없음 — UNIQUE 인덱스가 그대로 남는다. 쓰기 낭비만 제거.
--
-- 되돌리기: RLS는 `disable row level security`, 인덱스는 재생성.
-- ============================================================

alter table public.processed_webhook_events enable row level security;

drop index if exists public.profiles_stripe_customer_id_idx;
drop index if exists public.profiles_paypal_subscription_id_idx;
