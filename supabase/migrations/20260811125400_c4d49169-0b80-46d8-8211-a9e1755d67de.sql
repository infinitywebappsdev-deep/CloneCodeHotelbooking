create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  actor_email text not null default '',
  action text not null,
  entity text not null default '',
  entity_id text not null default '',
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

grant select on public.audit_logs to authenticated;
grant all on public.audit_logs to service_role;

alter table public.audit_logs enable row level security;

create policy "staff read audit logs" on public.audit_logs
  for select to authenticated
  using (public.is_staff(auth.uid()));

create index if not exists audit_logs_created_at_idx on public.audit_logs (created_at desc);

alter table public.pages
  add column if not exists published boolean not null default true,
  add column if not exists nav_label text not null default '',
  add column if not exists sort_order integer not null default 0;

create unique index if not exists pages_slug_key on public.pages (slug);