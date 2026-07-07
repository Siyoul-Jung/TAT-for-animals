-- ============================================================
-- profiles에 "결제 주기" 컬럼 추가 (표시 전용)
--
-- 대시보드가 "$27 / month" vs "$270 / year"를 정확히 보여주기 위한 값.
-- 접근 권한은 role이 결정하며, 이 컬럼은 표기(cadence)에만 쓰인다.
-- 웹훅(Stripe/PayPal 활성화·갱신)이 실제 청구된 가격/플랜의 주기를 여기에 기록한다.
--   billing_interval — 'month' | 'year'. NULL/미설정 = 'month'로 간주(과거 행 호환).
--
-- ⚠️ 이 컬럼은 코드(webhook·change-plan·dashboard)가 이미 읽고/쓰지만
--    생성 마이그레이션이 누락돼 있었다(프로덕션엔 수동 추가돼 동작 중).
--    이 파일은 그 갭을 닫아 새 환경도 마이그레이션만으로 재현 가능하게 한다.
--    멱등(`if not exists`) — 프로덕션에 이미 있으면 무동작, 재실행 안전.
-- 되돌리기: alter table public.profiles drop column billing_interval;
-- ============================================================

alter table public.profiles
  add column if not exists billing_interval text;
