-- Week 2 — manual RLS tests.
-- Run (PowerShell, from C:\laragon\www\supabase), after `db reset` + `npm run seed:users`:
--   Get-Content -Raw supabase/manual-tests/rls_week2.sql | docker exec -i supabase_db_supabase psql -U postgres -d postgres
--
-- Each test is its own begin … rollback: nothing is ever saved, and an error
-- in one test cannot abort the next one.
-- Lines starting with \ are psql commands (this file needs psql, not the Studio editor).

\pset footer off

-- ---------------------------------------------------------------------------
-- Setup (as postgres, outside any test)
-- ---------------------------------------------------------------------------

-- "Log in" as a user: put their id in the JWT claims, exactly like the API does.
-- Lives in pg_temp: disappears when this psql session ends, nothing created in the DB.
-- Fails loudly on a typo: a silent "no user" would turn every test into an anon test.
create function pg_temp.login(p_email text) returns void
language plpgsql as $$
declare
  v_id uuid;
begin
  select id into v_id from auth.users where email = p_email;
  if v_id is null then
    raise exception 'No auth user %. Did you run npm run seed:users?', p_email;
  end if;
  perform set_config(
    'request.jwt.claims',
    json_build_object('sub', v_id, 'role', 'authenticated')::text,
    true  -- local: ends with the transaction
  );
end $$;

-- Company ids, looked up once (users cannot see other companies once RLS applies).
-- \gset stores each column of the result in a psql variable: :dlc, :dlr
select id as dlc from public.companies where abv = 'DLC' \gset
select id as dlr from public.companies where abv = 'DLR' \gset

-- The read test, reused for every user (:counts is pasted in as text by psql).
\set counts 'select (select count(*) from public.cars) as cars, (select count(*) from public.companies) as companies, (select count(*) from public.car_statuses) as statuses, (select count(*) from public.profiles) as profiles, (select count(*) from public.user_companies) as links;'

-- ---------------------------------------------------------------------------
-- Read tests  (columns: cars | companies | statuses | profiles | links)
-- statuses = 5: the 4 reference statuses + "En service" (migration 20261117110548)
-- ---------------------------------------------------------------------------

\echo '== R1 admin           expect: 28 | 3 | 5 | 5 | 5'
begin;
  select pg_temp.login('admin@autosuite.test');
  set local role authenticated;
  :counts
rollback;

\echo '== R2 manager.dlc     expect:  9 | 1 | 5 | 1 | 1'
begin;
  select pg_temp.login('manager.dlc@autosuite.test');
  set local role authenticated;
  :counts
rollback;

\echo '== R3 viewer.dlr      expect: 10 | 1 | 5 | 1 | 1'
begin;
  select pg_temp.login('viewer.dlr@autosuite.test');
  set local role authenticated;
  :counts
rollback;

\echo '== R4 viewer.multi    expect: 18 | 2 | 5 | 1 | 2'
begin;
  select pg_temp.login('viewer.multi@autosuite.test');
  set local role authenticated;
  :counts
rollback;

\echo '== R5 inactive.dlc    expect:  0 | 0 | 5 | 1 | 1'
begin;
  select pg_temp.login('inactive.dlc@autosuite.test');
  set local role authenticated;
  :counts
rollback;

\echo '== R6 anon, cars      expect: ERROR permission denied for table cars'
begin;
  set local role anon;
  select count(*) from public.cars;
rollback;

\echo '== R7 anon, profiles  expect: ERROR permission denied for table profiles'
begin;
  set local role anon;
  select count(*) from public.profiles;
rollback;

-- ---------------------------------------------------------------------------
-- Write tests (counting the rows an UPDATE really touched: "with … returning")
-- ---------------------------------------------------------------------------

\echo '== W1 manager.dlc updates DLC cars           expect: 9'
begin;
  select pg_temp.login('manager.dlc@autosuite.test');
  set local role authenticated;
  with u as (
    update public.cars set couleur = 'Vert'
    where achat_societe_id = :dlc
    returning id
  ) select count(*) as updated from u;
rollback;

\echo '== W2 manager.dlc updates DLR cars           expect: 0 (no error: rows are invisible)'
begin;
  select pg_temp.login('manager.dlc@autosuite.test');
  set local role authenticated;
  with u as (
    update public.cars set couleur = 'Vert'
    where achat_societe_id = :dlr
    returning id
  ) select count(*) as updated from u;
rollback;

\echo '== W3 manager.dlc moves DLC cars to DLR      expect: ERROR new row violates row-level security policy'
begin;
  select pg_temp.login('manager.dlc@autosuite.test');
  set local role authenticated;
  update public.cars set achat_societe_id = :dlr
  where achat_societe_id = :dlc;
rollback;

\echo '== W4 viewer.dlr updates any car             expect: 0'
begin;
  select pg_temp.login('viewer.dlr@autosuite.test');
  set local role authenticated;
  with u as (
    update public.cars set couleur = 'Vert'
    returning id
  ) select count(*) as updated from u;
rollback;

\echo '== W5 manager.dlc inserts a DLR car          expect: ERROR new row violates row-level security policy'
begin;
  select pg_temp.login('manager.dlc@autosuite.test');
  set local role authenticated;
  insert into public.cars (immat, achat_societe_id) values ('TEST-1', :dlr);
rollback;

\echo '== W6 admin hard-deletes a car               expect: ERROR permission denied for table cars'
begin;
  select pg_temp.login('admin@autosuite.test');
  set local role authenticated;
  delete from public.cars where id = 1;
rollback;

\echo '== W7 viewer.dlr makes itself admin          expect: ERROR permission denied for table profiles'
begin;
  select pg_temp.login('viewer.dlr@autosuite.test');
  set local role authenticated;
  update public.profiles set role = 'admin' where id = auth.uid();
rollback;

\echo '== W8 inactive.dlc updates DLC cars          expect: 0'
begin;
  select pg_temp.login('inactive.dlc@autosuite.test');
  set local role authenticated;
  with u as (
    update public.cars set couleur = 'Vert'
    where achat_societe_id = :dlc
    returning id
  ) select count(*) as updated from u;
rollback;

\echo '== Done. Compare each result with its "expect" line.'
