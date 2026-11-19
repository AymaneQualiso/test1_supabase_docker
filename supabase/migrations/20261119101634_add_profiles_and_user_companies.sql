create type public.app_role as enum ('admin', 'manager', 'viewer');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name   text not null,
  is_active   boolean not null default true,
  role        public.app_role not null default 'viewer',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create table public.user_companies (
  user_id     uuid   not null references public.profiles(id)  on delete cascade,
  company_id  bigint not null references public.companies(id) on delete restrict,
  created_at  timestamptz not null default now(),
  primary key (user_id, company_id)
);

create index user_companies_company_id_idx on public.user_companies (company_id);


create trigger user_companies_set_updated_at
before update on public.user_companies
for each row execute function public.set_updated_at();

-- 1) RLS on all tables, always
alter table public.profiles        enable row level security;
alter table public.user_companies  enable row level security;

grant select on public.profiles, public.user_companies
  to authenticated;