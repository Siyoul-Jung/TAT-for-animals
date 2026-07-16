-- ============================================================
-- SECURITY (P0): lock down which profiles columns a logged-in user can write.
--
-- The UPDATE policy ("profiles: 본인 수정") is `using (auth.uid() = id)` with no
-- WITH CHECK and no column restriction. Postgres defaults WITH CHECK to USING,
-- so an authenticated user could rewrite ANY column of their own row — including
-- `role` and `subscription_status`. Access is decided from exactly those columns
-- (server-side, e.g. library/page.tsx), and the anon key is public (in the client
-- bundle), so a free user could call PostgREST directly:
--     supabase.from('profiles').update({ role:'pro_subscriber' }).eq('id', myId)
-- and self-grant the full paid library — a complete paywall bypass.
--
-- Fix: authenticated users may UPDATE only their display fields. Every
-- subscription/access column is written exclusively by the service role
-- (webhooks / checkout / refund / reconcile), which bypasses RLS and these
-- grants — so this doesn't affect any legitimate write. The RLS SELECT/UPDATE
-- policies (own-row) stay in place; this just removes the privileged columns
-- from the authenticated write grant.
--
-- Idempotent (revoke/grant are safe to re-run). Rollback: re-`grant update on
-- public.profiles to authenticated;` (NOT recommended — that reopens the hole).
-- ============================================================

revoke update on public.profiles from anon, authenticated;

-- Re-grant only the non-privileged display fields a member may edit themselves.
grant update (full_name, avatar_url) on public.profiles to authenticated;
