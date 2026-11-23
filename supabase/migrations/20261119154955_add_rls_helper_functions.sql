create schema if not exists private;

create or replace function private.my_role()
returns public.app_role
language sql
stable
security definer
set search_path = ''
as $$
  select p.role
  from public.profiles p
  where p.id = auth.uid()
    and p.is_active
$$;

grant usage on schema private to authenticated;

create or replace function private.my_company_ids()
returns setof bigint
language sql
stable
security definer
set search_path = ''
as $$
  select uc.company_id
  from public.user_companies uc
  join public.profiles p on p.id = uc.user_id
  where uc.user_id = auth.uid()
    and p.is_active
$$;

revoke execute on function private.my_role() from public, anon;
grant  execute on function private.my_role() to authenticated;

revoke execute on function private.my_company_ids() from public, anon;
grant  execute on function private.my_company_ids() to authenticated;