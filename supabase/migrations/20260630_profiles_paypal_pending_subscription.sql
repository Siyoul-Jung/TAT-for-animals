-- ============================================================
-- profiles에 "대기 중(승인 전) PayPal 구독 id" 컬럼 추가
--
-- 배경: PayPal 결제는 "구독 생성 → 사용자 승인 → 활성화(ACTIVE)"의 3단계다.
--   생성 직후~webhook이 활성 상태를 기록하기 전까지 우리 DB는 구독을 못 본다.
--   이 창에서 사용자가 다시 결제를 시도하면 두 번째 구독이 열려 이중 청구가 날 수
--   있었다(Stripe는 subscriptions.list로 직접 재확인해 막지만, PayPal은 "구독 목록
--   조회"를 지원하지 않아 시간(15분 버킷)으로만 막고 있었다).
--
-- 해결: 생성된 구독 id를 즉시 이 컬럼에 기록해두고, 다음 시도 때 그 id를 PayPal에
--   콕 집어 상태 조회(GET)한다 — 살아있으면 차단, 승인 전이면 같은 승인 화면으로,
--   버려졌으면(CANCELLED/EXPIRED) 새로 진행. 시간 추측이 아닌 실제 상태로 판단한다.
--
--   paypal_pending_subscription_id — 승인 전 구독 id | NULL=진행 중 없음
--
-- 활성화되면(success 핸들러 + ACTIVATED webhook) NULL로 클리어한다.
-- 되돌리기:
--   alter table public.profiles drop column paypal_pending_subscription_id;
-- ============================================================

alter table public.profiles
  add column if not exists paypal_pending_subscription_id text;
