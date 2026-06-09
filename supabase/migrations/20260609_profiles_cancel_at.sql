-- ============================================================
-- profiles에 "취소 예약일" 컬럼 추가 (표시 전용)
--
-- 구독을 기간말 취소(cancel_at_period_end)로 설정하면, 사용자는 결제한
-- 기간이 끝날 때까지 접근을 유지한다. 그 사이 대시보드가 "X일까지 유지 후
-- 종료"를 명확히 보여주기 위한 단일 진실 소스. role/status는 그대로 active.
--
--   cancel_at — 구독이 종료되는 시점 (= Stripe subscription.cancel_at).
--               NULL = 취소 예약 없음.
--
-- 사용자가 재개(resume)하거나 실제로 종료(subscription.deleted)되면 NULL로 클리어.
-- pending_tier(다운그레이드 예약)와 같은 패턴 [[project-plan-change-timing]].
-- 되돌리기: alter table public.profiles drop column cancel_at;
-- ============================================================

alter table public.profiles
  add column if not exists cancel_at timestamptz;
