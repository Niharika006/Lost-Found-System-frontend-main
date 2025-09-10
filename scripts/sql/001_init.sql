create extension if not exists "uuid-ossp";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'user' check (role in ('user','volunteer','admin')),
  created_at timestamptz default now()
);

create table if not exists public.reports (
  id uuid primary key default uuid_generate_v4(),
  type text not null check (type in ('lost','found')),
  title text not null,
  description text,
  category text,
  language text default 'English',
  photo_url text,
  photo_base64 text,
  lat double precision,
  lng double precision,
  location_text text,
  contact text,
  status text not null default 'open' check (status in ('open','matched','closed')),
  created_by uuid references public.profiles(id),
  created_at timestamptz default now()
);

create table if not exists public.matches (
  id uuid primary key default uuid_generate_v4(),
  lost_report_id uuid references public.reports(id) on delete cascade,
  found_report_id uuid references public.reports(id) on delete cascade,
  confidence numeric not null default 0,
  status text not null default 'suggested' check (status in ('suggested','confirmed','rejected')),
  created_by uuid references public.profiles(id),
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;
alter table public.reports enable row level security;
alter table public.matches enable row level security;

create policy if not exists "profiles_self"
on public.profiles for select using (auth.uid() = id);

create policy if not exists "profiles_insert_self"
on public.profiles for insert with check (auth.uid() = id);

create policy if not exists "reports_read_own_or_volunteer"
on public.reports for select using (
  exists(select 1 from public.profiles p where p.id = auth.uid() and p.role in ('volunteer','admin'))
  or created_by = auth.uid()
);

create policy if not exists "reports_insert_owner"
on public.reports for insert with check (created_by = auth.uid());

create policy if not exists "reports_update_owner"
on public.reports for update using (created_by = auth.uid()) with check (created_by = auth.uid());

create policy if not exists "matches_read_volunteer_or_related_owner"
on public.matches for select using (
  exists(select 1 from public.profiles p where p.id = auth.uid() and p.role in ('volunteer','admin'))
  or exists(select 1 from public.reports r where (r.id = lost_report_id or r.id = found_report_id) and r.created_by = auth.uid())
);

create policy if not exists "matches_write_volunteer"
on public.matches for insert with check (
  exists(select 1 from public.profiles p where p.id = auth.uid() and p.role in ('volunteer','admin'))
);

create policy if not exists "matches_update_volunteer"
on public.matches for update using (
  exists(select 1 from public.profiles p where p.id = auth.uid() and p.role in ('volunteer','admin'))
) with check (
  exists(select 1 from public.profiles p where p.id = auth.uid() and p.role in ('volunteer','admin'))
);
