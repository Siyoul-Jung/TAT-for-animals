-- profiles 테이블에 Stripe 관련 컬럼 추가
-- Stripe 고객 ID와 구독 상태를 profiles에서 직접 관리
-- (subscriptions 별도 테이블은 비즈니스 확정 후 추가 예정)

alter table public.profiles
  add column if not exists stripe_customer_id text unique,
  add column if not exists stripe_subscription_id text,
  add column if not exists subscription_status text default 'inactive';
  -- inactive | active | canceled | past_due

-- stripe_customer_id로 빠른 조회를 위한 인덱스
create index if not exists profiles_stripe_customer_id_idx
  on public.profiles (stripe_customer_id);
