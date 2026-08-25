alter table public.site_settings
  add column if not exists audit_retention_days integer not null default 365,
  add column if not exists audit_archive_enabled boolean not null default true;

alter table public.pages
  add column if not exists draft jsonb,
  add column if not exists draft_updated_at timestamptz;

create table if not exists public.audit_archives (
  id uuid primary key default gen_random_uuid(),
  period_start timestamptz not null,
  period_end timestamptz not null,
  row_count integer not null default 0,
  rows jsonb not null default '[]'::jsonb,
  created_by uuid,
  actor_email text not null default '',
  created_at timestamptz not null default now()
);
grant select on public.audit_archives to authenticated;
grant all on public.audit_archives to service_role;
alter table public.audit_archives enable row level security;
create policy "staff read audit archives" on public.audit_archives
  for select to authenticated using (public.is_staff(auth.uid()));

create table if not exists public.page_versions (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.pages(id) on delete cascade,
  version integer not null default 1,
  snapshot jsonb not null default '{}'::jsonb,
  note text not null default '',
  actor_id uuid,
  actor_email text not null default '',
  created_at timestamptz not null default now()
);
create index if not exists page_versions_page_idx on public.page_versions(page_id, created_at desc);
grant select, insert, delete on public.page_versions to authenticated;
grant all on public.page_versions to service_role;
alter table public.page_versions enable row level security;
create policy "staff read page versions" on public.page_versions
  for select to authenticated using (public.is_staff(auth.uid()));
create policy "staff write page versions" on public.page_versions
  for insert to authenticated with check (public.is_staff(auth.uid()));
create policy "staff delete page versions" on public.page_versions
  for delete to authenticated using (public.is_staff(auth.uid()));