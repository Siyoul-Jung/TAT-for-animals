-- ============================================================
-- profiles.billing_interval에 허용 값 제약(CHECK) 추가
--
-- 20260706_profiles_billing_interval.sql이 컬럼만 추가하고 제약을 빠뜨렸다.
-- 문서화된 값 집합은 'month' | 'year' | NULL(과거 행 = month로 간주) —
-- role/subscription_status와 동일하게 DB가 이 집합만 허용하게 굳힌다
-- (docs/standards.md의 "text 상태 컬럼 → CHECK" 체크리스트, 0602/0603 전례).
--
-- 적용 전제: 기존 값이 month/year/NULL의 부분집합 (코드가 getPlanInterval로만
--   기록하므로 충족). 확인: select billing_interval, count(*) from public.profiles group by 1;
--   (CHECK는 NULL을 자동 허용하므로 NULL 행은 문제없음.)
--
-- 멱등: 이미 제약이 있으면 무동작 — 재실행 안전.
-- 되돌리기: alter table public.profiles drop constraint profiles_billing_interval_check;
-- ============================================================

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'profiles_billing_interval_check'
  ) then
    alter table public.profiles
      add constraint profiles_billing_interval_check
      check (billing_interval in ('month', 'year'));
  end if;
end $$;
