-- ============================================================
-- profiles.subscription_status에 허용 값 제약(CHECK) 추가
--
-- 웹훅이 domainStatus()로 Stripe의 여러 상태를 3개로 매핑하도록 수정됐으므로
-- (코드 선행 완료), 이제 DB가 이 3개만 허용하게 굳힐 수 있다.
-- 값은 NULL이거나 active | past_due | inactive 중 하나.
--
-- 적용 전제: 기존 subscription_status 값이 위 3개(또는 NULL)의 부분집합.
--   확인 쿼리: select subscription_status, count(*) from public.profiles group by 1;
--   → 옛 원본 Stripe 상태('canceled','trialing' 등)가 남아 있으면 먼저 정리 후 적용.
--   (CHECK는 NULL을 자동 허용하므로 NULL 행은 문제없음.)
--
-- 되돌리기: alter table public.profiles drop constraint profiles_subscription_status_check;
-- ============================================================

alter table public.profiles
  add constraint profiles_subscription_status_check
  check (subscription_status in ('active', 'past_due', 'inactive'));
