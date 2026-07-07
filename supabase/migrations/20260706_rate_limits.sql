-- ============================================================
-- Rate limiting store (shared across serverless instances).
--
-- Vercel functions don't share memory, so an in-memory throttle only slows a
-- bot hitting the same warm instance. This table + function give a fixed-window
-- counter that every instance shares, used to bound abuse of the email/payment
-- routes (account deletion, checkout, change-plan, contact).
--
-- Only the service role touches this table (RLS on, no policies). Rows are
-- self-cleaning: an expired window resets in place, so the table stays small.
-- 되돌리기: drop function public.check_rate_limit; drop table public.rate_limits;
-- ============================================================

create table if not exists public.rate_limits (
  key          text primary key,           -- "<scope>:<user_id|ip>"
  count        integer not null default 0,
  window_start timestamptz not null default now()
);

alter table public.rate_limits enable row level security;
-- No policies → anon/authenticated are fully blocked; service_role bypasses RLS.

-- Atomic check-and-increment. Returns TRUE if the call is allowed (i.e. the
-- post-increment count is within p_limit for the current window), FALSE if it
-- should be rate-limited. A single upsert, so concurrent calls can't race.
create or replace function public.check_rate_limit(
  p_key text,
  p_limit integer,
  p_window_seconds integer
) returns boolean
language plpgsql
as $$
declare
  v_now   timestamptz := now();
  v_count integer;
begin
  insert into public.rate_limits (key, count, window_start)
    values (p_key, 1, v_now)
  on conflict (key) do update
    set
      count = case
        when public.rate_limits.window_start < v_now - make_interval(secs => p_window_seconds)
          then 1
        else public.rate_limits.count + 1
      end,
      window_start = case
        when public.rate_limits.window_start < v_now - make_interval(secs => p_window_seconds)
          then v_now
        else public.rate_limits.window_start
      end
  returning count into v_count;

  return v_count <= p_limit;
end;
$$;
