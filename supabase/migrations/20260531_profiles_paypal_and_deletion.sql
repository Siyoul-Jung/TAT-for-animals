-- profiles에 누락된 컬럼 추가
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS paypal_subscription_id TEXT UNIQUE;

CREATE INDEX IF NOT EXISTS profiles_paypal_subscription_id_idx
  ON public.profiles (paypal_subscription_id);

-- 계정 삭제 요청 테이블
CREATE TABLE IF NOT EXISTS public.account_deletion_requests (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  requested_at TIMESTAMPTZ NOT NULL,
  status      TEXT NOT NULL DEFAULT 'pending',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.account_deletion_requests ENABLE ROW LEVEL SECURITY;

-- 본인 요청만 읽기 가능 (service_role은 RLS bypass)
CREATE POLICY "account_deletion_requests: 본인 읽기"
  ON public.account_deletion_requests FOR SELECT
  USING (auth.uid() = user_id);
