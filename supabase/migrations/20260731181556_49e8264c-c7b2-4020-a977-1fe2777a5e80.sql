-- ROLES -------------------------------------------------------------
create type public.app_role as enum ('admin', 'staff', 'guest');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  phone text,
  created_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create or replace function public.is_staff(_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role in ('admin','staff'))
$$;

create policy "own profile read" on public.profiles for select to authenticated using (id = auth.uid() or public.is_staff(auth.uid()));
create policy "own profile write" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy "own profile insert" on public.profiles for insert to authenticated with check (id = auth.uid());
create policy "own roles read" on public.user_roles for select to authenticated using (user_id = auth.uid() or public.is_staff(auth.uid()));

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  return new;
end; $$;

create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

-- SHARED --------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end; $$;

-- ROOMS ---------------------------------------------------------------
create table public.rooms (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  blurb text not null default '',
  rate integer not null default 0,
  units integer not null default 1,
  occupancy text not null default '2 guests',
  size text not null default '',
  image_url text,
  features text[] not null default '{}',
  published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.rooms to anon;
grant select, insert, update, delete on public.rooms to authenticated;
grant all on public.rooms to service_role;
alter table public.rooms enable row level security;
create policy "public read rooms" on public.rooms for select to anon, authenticated using (published or public.is_staff(auth.uid()));
create policy "staff manage rooms" on public.rooms for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));
create trigger rooms_touch before update on public.rooms for each row execute function public.touch_updated_at();

-- RESERVATIONS --------------------------------------------------------
create table public.reservations (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  user_id uuid references auth.users(id) on delete set null,
  guest_name text not null,
  guest_email text not null,
  guest_phone text not null default '',
  room_id uuid references public.rooms(id) on delete set null,
  room_name text not null default '',
  check_in date not null,
  check_out date not null,
  guests integer not null default 1,
  nights integer not null default 1,
  rate integer not null default 0,
  total integer not null default 0,
  status text not null default 'pending',
  payment_status text not null default 'unpaid',
  source text not null default 'website',
  requests text not null default '',
  staff_notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.reservations to authenticated;
grant all on public.reservations to service_role;
alter table public.reservations enable row level security;
create policy "guests read own reservations" on public.reservations for select to authenticated
  using (user_id = auth.uid() or lower(guest_email) = lower(coalesce(auth.jwt() ->> 'email','')) or public.is_staff(auth.uid()));
create policy "staff manage reservations" on public.reservations for all to authenticated
  using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));
create trigger reservations_touch before update on public.reservations for each row execute function public.touch_updated_at();
create index reservations_dates_idx on public.reservations (room_id, check_in, check_out);

-- MESSAGES ------------------------------------------------------------
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  reservation_id uuid not null references public.reservations(id) on delete cascade,
  sender text not null default 'guest',
  author_id uuid references auth.users(id) on delete set null,
  body text not null,
  read_by_staff boolean not null default false,
  created_at timestamptz not null default now()
);
grant select, insert, update on public.messages to authenticated;
grant all on public.messages to service_role;
alter table public.messages enable row level security;
create policy "thread participants read" on public.messages for select to authenticated using (
  public.is_staff(auth.uid()) or exists (
    select 1 from public.reservations r where r.id = reservation_id
      and (r.user_id = auth.uid() or lower(r.guest_email) = lower(coalesce(auth.jwt() ->> 'email','')))
  )
);
create policy "thread participants write" on public.messages for insert to authenticated with check (
  public.is_staff(auth.uid()) or exists (
    select 1 from public.reservations r where r.id = reservation_id
      and (r.user_id = auth.uid() or lower(r.guest_email) = lower(coalesce(auth.jwt() ->> 'email','')))
  )
);
create policy "staff update messages" on public.messages for update to authenticated
  using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));

-- CMS -----------------------------------------------------------------
create table public.pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null default '',
  subtitle text not null default '',
  body text not null default '',
  meta_description text not null default '',
  updated_at timestamptz not null default now()
);
grant select on public.pages to anon;
grant select, insert, update, delete on public.pages to authenticated;
grant all on public.pages to service_role;
alter table public.pages enable row level security;
create policy "public read pages" on public.pages for select to anon, authenticated using (true);
create policy "staff manage pages" on public.pages for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));
create trigger pages_touch before update on public.pages for each row execute function public.touch_updated_at();

create table public.gallery_images (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  caption text not null default '',
  category text not null default 'hotel',
  sort_order integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now()
);
grant select on public.gallery_images to anon;
grant select, insert, update, delete on public.gallery_images to authenticated;
grant all on public.gallery_images to service_role;
alter table public.gallery_images enable row level security;
create policy "public read gallery" on public.gallery_images for select to anon, authenticated using (published or public.is_staff(auth.uid()));
create policy "staff manage gallery" on public.gallery_images for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));

create table public.faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  sort_order integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now()
);
grant select on public.faqs to anon;
grant select, insert, update, delete on public.faqs to authenticated;
grant all on public.faqs to service_role;
alter table public.faqs enable row level security;
create policy "public read faqs" on public.faqs for select to anon, authenticated using (published or public.is_staff(auth.uid()));
create policy "staff manage faqs" on public.faqs for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));

-- AVAILABILITY --------------------------------------------------------
create or replace function public.room_availability(p_check_in date, p_check_out date)
returns table (room_id uuid, slug text, name text, units integer, booked integer, available integer, rate integer)
language sql stable security definer set search_path = public as $$
  select r.id, r.slug, r.name, r.units,
         coalesce(b.cnt, 0)::int as booked,
         greatest(r.units - coalesce(b.cnt, 0), 0)::int as available,
         r.rate
  from public.rooms r
  left join (
    select res.room_id, count(*) as cnt
    from public.reservations res
    where res.status in ('pending','confirmed','checked_in')
      and res.check_in < p_check_out
      and res.check_out > p_check_in
    group by res.room_id
  ) b on b.room_id = r.id
  where r.published
  order by r.sort_order;
$$;
grant execute on function public.room_availability(date, date) to anon, authenticated, service_role;
