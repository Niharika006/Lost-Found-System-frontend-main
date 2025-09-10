-- Add performance indexes and refine RLS to support volunteers/admin flows

-- indexes
create index if not exists idx_reports_type_status on public.reports(type, status);
create index if not exists idx_reports_created_at on public.reports(created_at desc);
create index if not exists idx_matches_status on public.matches(status);
create index if not exists idx_matches_confidence on public.matches(confidence desc);

-- ensure role column exists (from 001, keep as-is)
alter table if exists public.profiles
  alter column role set default 'user';

-- broaden volunteer/admin read/update for reports
drop policy if exists "reports_update_owner" on public.reports;
create policy "reports_update_owner_or_volunteer"
on public.reports for update
using (
  created_by = auth.uid()
  or exists(select 1 from public.profiles p where p.id = auth.uid() and p.role in ('volunteer','admin'))
)
with check (
  created_by = auth.uid()
  or exists(select 1 from public.profiles p where p.id = auth.uid() and p.role in ('volunteer','admin'))
);

-- allow volunteers/admin to insert matches (already present, re-assert idempotent)
drop policy if exists "matches_write_volunteer" on public.matches;
create policy "matches_write_volunteer"
on public.matches for insert
with check (exists(select 1 from public.profiles p where p.id = auth.uid() and p.role in ('volunteer','admin')));

-- allow volunteers/admin to update matches
drop policy if exists "matches_update_volunteer" on public.matches;
create policy "matches_update_volunteer"
on public.matches for update
using (exists(select 1 from public.profiles p where p.id = auth.uid() and p.role in ('volunteer','admin')))
with check (exists(select 1 from public.profiles p where p.id = auth.uid() and p.role in ('volunteer','admin')));
