-- ============================================================
-- profiles에 "예약된 다운그레이드" 표시용 컬럼 추가
--
-- 배경: 다운그레이드는 이미 지불한 기간이 끝날 때 적용된다(기간말 전환).
--   - Stripe: Customer Portal이 decreasing_item_amount를 period end로 예약.
--   - PayPal: revise 후 role을 즉시 내리지 않고 다음 결제(PAYMENT.SALE.COMPLETED)에 적용.
-- 그 사이("아직 Pro지만 곧 Basic으로 내려감")를 사용자에게 명확히 보여주기 위한
-- 단일 진실 소스. 권한(role) 자체는 바뀌지 않으며, 이 값은 순수 표시용이다.
--
--   pending_tier     — 전환될 목표 등급 (subscriber | pro_subscriber) | NULL=예약 없음
--   pending_tier_at  — 전환 시점 (= current_period_end / 다음 결제일)
--
-- 전환이 실제로 일어나거나(웹훅이 role을 동기화) 사용자가 되돌리면 둘 다 NULL로 클리어.
-- 되돌리기:
--   alter table public.profiles drop constraint profiles_pending_tier_check;
--   alter table public.profiles drop column pending_tier, drop column pending_tier_at;
-- ============================================================

alter table public.profiles
  add column if not exists pending_tier    text,
  add column if not exists pending_tier_at timestamptz;

alter table public.profiles
  add constraint profiles_pending_tier_check
  check (pending_tier in ('subscriber', 'pro_subscriber'));
