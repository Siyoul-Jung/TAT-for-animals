-- 계정 삭제 확인 토큰 컬럼 추가
ALTER TABLE public.account_deletion_requests
  ADD COLUMN IF NOT EXISTS token TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;
