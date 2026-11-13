insert into public.companies (label, abv, city) values
  ('Demo Location Casablanca', 'DLC', 'Casablanca'),
  ('Demo Leasing Rabat',       'DLR', 'Rabat'),
  ('Demo Fleet Tanger',        'DFT', 'Tanger');

insert into public.societe_marques (libelle, company_id, is_active)
select b.libelle, c.id, b.is_active
from (values
  ('Marque Alpha',   'DLC', true),
  ('Marque Beta',    'DLC', true),
  ('Marque Gamma',   'DLR', true),
  ('Marque Delta',   'DLR', true),
  ('Marque Epsilon', 'DFT', true),
  ('Marque Zeta',    'DFT', false)
) as b(libelle, abv, is_active)
join public.companies c on c.abv = b.abv;

insert into public.cars (immat, couleur, km_dernier, date_mce,
                         societe_marque_id, achat_societe_id, car_statut_id)
select
  format('%s-A-%s', 10000 + n, 1 + n % 3),                    -- plate: 10001-A-2 …
  (array['Blanc','Noir','Gris','Rouge'])[1 + n % 4],          -- colour cycles
  n * 1250,                                                   -- mileage
  date '2024-01-01' + n * 10,                                 -- registration date
  m.id,
  m.company_id,
  s.id
from generate_series(1, 30) as n
cross join lateral (
  select id, company_id from public.societe_marques order by id offset (n % 6) limit 1
) m
cross join lateral (
  select id from public.car_statuses order by id offset (n % 4) limit 1
) s;

update public.cars set deleted_at = now()
where id in (select id from public.cars order by id desc limit 2);