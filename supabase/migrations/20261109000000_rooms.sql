create table public.rooms (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users on delete cascade,
  name text not null,
  -- SavedRoom 전체 { schemaVersion, room }
  data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index rooms_owner_updated_idx on public.rooms (owner_id, updated_at desc);

create function public.set_updated_at() returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger rooms_set_updated_at
  before update on public.rooms
  for each row execute function public.set_updated_at();

alter table public.rooms enable row level security;

create policy rooms_select on public.rooms
  for select to authenticated using (owner_id = (select auth.uid()));
create policy rooms_insert on public.rooms
  for insert to authenticated with check (owner_id = (select auth.uid()));
create policy rooms_update on public.rooms
  for update to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));
create policy rooms_delete on public.rooms
  for delete to authenticated using (owner_id = (select auth.uid()));

-- 익명 로그인 사용자도 authenticated 역할이므로 anon 접근만 차단
revoke all on public.rooms from anon;
grant select, insert, update, delete on public.rooms to authenticated;
