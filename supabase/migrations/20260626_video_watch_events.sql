-- video_watch_events: per-user video progress (resume position + completed mark)
-- shown as the progress bar / check icon in the library.
--
-- NOTE: this table already exists in production (it was created ad hoc, without a
-- migration). This file documents the real schema so local/staging environments
-- match. It is written idempotently so re-running it against prod is a no-op.
--
-- Related bug (2026-06-26): the app's upsert omitted content_type — which is
-- NOT NULL with no default — so every save failed silently and progress never
-- persisted across a refresh. Fixed in src/lib/videoProgress.ts.

create table if not exists public.video_watch_events (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references public.profiles(id) on delete cascade,
  content_id     text not null,                                   -- Sanity document id
  content_type   text not null check (content_type in ('video', 'webinar')),
  watched_at     timestamptz not null default now(),
  watch_duration integer,
  completed      boolean default false,
  last_position  integer default 0,                               -- resume point, in seconds
  updated_at     timestamptz default now(),
  constraint video_watch_events_user_content_unique unique (user_id, content_id)
);

alter table public.video_watch_events enable row level security;

-- Members can read and write only their own watch events.
drop policy if exists "Users manage own watch events" on public.video_watch_events;
create policy "Users manage own watch events"
  on public.video_watch_events
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
