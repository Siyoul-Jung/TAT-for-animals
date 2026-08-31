-- ============================================================
-- profiles에 "실제 가입한 가격/요금제 ID" 컬럼 추가 (표시 전용)
--
-- 대시보드는 지금까지 role(subscriber/pro_subscriber)만 보고 고정된 가격
-- 문구("$47 / month")를 보여줬다. Founding Member($10/mo, 2026-08-30 추가)처럼
-- 같은 role이면서 다른 가격을 내는 회원이 생기면서, 그 회원의 대시보드에
-- 실제와 다른 가격("$47")이 표시되는 문제가 드러났다.
--
-- 이 컬럼은 Stripe price ID 또는 PayPal plan ID를 그대로 저장한다(문자열,
-- provider 무관). 웹훅/성공처리/셀프힐이 role을 설정하는 시점에 함께 기록한다.
-- 접근 권한은 여전히 role이 결정 — 이 컬럼은 표시(display)에만 쓰인다.
--   plan_price_id — NULL/미설정 = 과거 행(가격 라벨은 role 기준 fallback으로 표시).
-- 되돌리기: alter table public.profiles drop column plan_price_id;
-- ============================================================

alter table public.profiles
  add column if not exists plan_price_id text;
