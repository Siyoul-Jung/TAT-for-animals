-- ============================================================
-- profiles 테이블
-- auth.users를 확장 — 앱 데이터는 여기서 관리
-- ============================================================

create table public.profiles (
  id          uuid references auth.users(id) on delete cascade primary key,
  email       text,
  full_name   text,
  avatar_url  text,
  -- 역할: guest | subscriber | certified_pro | certified_trainer | admin
  -- 정확한 역할 목록은 비즈니스 확정 후 enum으로 교체 가능
  role        text not null default 'guest',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ── RLS 활성화 ──────────────────────────────────────────────
alter table public.profiles enable row level security;

-- 본인 프로필만 읽기 가능
create policy "profiles: 본인 읽기"
  on public.profiles for select
  using (auth.uid() = id);

-- 본인 프로필만 수정 가능
create policy "profiles: 본인 수정"
  on public.profiles for update
  using (auth.uid() = id);

-- ── 가입 시 자동 생성 트리거 ────────────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── updated_at 자동 갱신 ────────────────────────────────────
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();
