-- 마지막 활동 90일 지난 익명 계정 삭제, rooms는 on delete cascade로 함께 삭제
-- 활동 기준: 세션 갱신(auth.sessions)과 last_sign_in_at 중 최근 값, 둘 다 없으면 created_at
create function public.delete_stale_anonymous_users() returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  deleted integer;
begin
  delete from auth.users u
  where u.is_anonymous
    and greatest(
      u.created_at,
      u.last_sign_in_at,
      (
        select max(greatest(s.created_at, s.updated_at, s.refreshed_at))
        from auth.sessions s
        where s.user_id = u.id
      )
    ) < now() - interval '90 days';
  get diagnostics deleted = row_count;
  return deleted;
end;
$$;

revoke all on function public.delete_stale_anonymous_users() from public, anon, authenticated;

create extension if not exists pg_cron with schema pg_catalog;

-- 매일 18:00 UTC (KST 03:00)
select cron.schedule(
  'delete-stale-anonymous-users',
  '0 18 * * *',
  'select public.delete_stale_anonymous_users()'
);
