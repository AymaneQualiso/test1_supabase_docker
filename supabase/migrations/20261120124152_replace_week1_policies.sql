drop policy week1_read on public.cars;
drop policy week1_read on public.companies;
drop policy week1_read on public.societe_marques;
drop policy week1_read on public.car_statuses;

revoke select on public.cars, public.companies,
                 public.societe_marques, public.car_statuses from anon;

create policy "cars: read own companies"
on public.cars
for select
to authenticated
using (
  deleted_at is null
  and (
    (select private.my_role()) = 'admin'
    or achat_societe_id in (select private.my_company_ids())
  )
);

-- Policies only filter what a grant allows: without these, nobody can write
grant insert, update on public.cars to authenticated;

create policy "cars: managers insert into own companies"
on public.cars
for insert
to authenticated
with check (
  (select private.my_role()) = 'admin'
  or (
    (select private.my_role()) = 'manager'
    and achat_societe_id in (select private.my_company_ids())
  )
);

create policy "cars: managers update own companies"
on public.cars
for update
to authenticated
using (
  (select private.my_role()) = 'admin'
  or (
    (select private.my_role()) = 'manager'
    and achat_societe_id in (select private.my_company_ids())
  )
)
with check (
  (select private.my_role()) = 'admin'
  or (
    (select private.my_role()) = 'manager'
    and achat_societe_id in (select private.my_company_ids())
  )
);

create policy "companies: read own companies"
on public.companies
for select
to authenticated
using (
  deleted_at is null
  and (
    (select private.my_role()) = 'admin'
    or id in (select private.my_company_ids())
  )
);

create policy "societe_marques: read own companies"
on public.societe_marques
for select
to authenticated
using (
  deleted_at is null
  and (
    (select private.my_role()) = 'admin'
    or company_id in (select private.my_company_ids())
  )
);

create policy "car_statuses: read for logged-in users"
on public.car_statuses
for select
to authenticated
using (true);

create policy "profiles: read own or admin"
on public.profiles
for select
to authenticated
using (
  id = (select auth.uid())
  or (select private.my_role()) = 'admin'
);

create policy "user_companies: read own or admin"
on public.user_companies
for select
to authenticated
using (
  user_id = (select auth.uid())
  or (select private.my_role()) = 'admin'
);


-- Supabase grants ALL on new public tables by default: keep only what each role needs.

-- anon: nothing, anywhere
revoke all on public.cars, public.companies, public.societe_marques,
              public.car_statuses, public.profiles, public.user_companies
  from anon;

-- authenticated: read-only on reference and access tables
revoke insert, update, delete, truncate, references, trigger
  on public.companies, public.societe_marques, public.car_statuses,
     public.profiles, public.user_companies
  from authenticated;

-- authenticated on cars: select, insert, update only (soft delete, no hard delete)
revoke delete, truncate, references, trigger on public.cars from authenticated;