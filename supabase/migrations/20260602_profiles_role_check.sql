-- ============================================================
-- profiles.role에 허용 값 제약(CHECK) 추가
--
-- 앱이 쓰는 role 값은 3개뿐: guest | subscriber | pro_subscriber
-- 오타나 잘못된 값(예: 'subscribr')이 저장되면 콘텐츠 접근 권한이
-- 조용히 깨진다. 이 제약은 그런 값을 DB가 거부하게 만든다.
--
-- 적용 전제 (확인됨 2026-06-02):
--   기존 profiles.role 값이 위 3개의 부분집합 (실제: guest, pro_subscriber).
--   확인 쿼리: select role, count(*) from public.profiles group by role;
--   → 3개 외의 값이 있으면 이 마이그레이션은 적용을 거부(안전하게 실패)한다.
--
-- 새 역할(예: admin)을 도입하면 아래 목록도 함께 수정할 것.
-- 되돌리기: alter table public.profiles drop constraint profiles_role_check;
-- ============================================================

alter table public.profiles
  add constraint profiles_role_check
  check (role in ('guest', 'subscriber', 'pro_subscriber'));
