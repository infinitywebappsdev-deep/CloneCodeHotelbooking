create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select (auth.uid() is null or _user_id = auth.uid())
     and exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create or replace function public.is_staff(_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select (auth.uid() is null or _user_id = auth.uid())
     and exists (select 1 from public.user_roles where user_id = _user_id and role in ('admin','staff'))
$$;

revoke execute on function public.has_role(uuid, app_role) from public, anon;
revoke execute on function public.is_staff(uuid) from public, anon;
revoke execute on function public.room_availability(date, date) from public, anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.touch_updated_at() from public, anon, authenticated;

drop policy if exists "staff read media" on storage.objects;
drop policy if exists "staff upload media" on storage.objects;
drop policy if exists "staff update media" on storage.objects;
drop policy if exists "staff delete media" on storage.objects;

create policy "staff read media" on storage.objects
  for select to authenticated
  using (bucket_id = 'media' and public.is_staff(auth.uid()));

create policy "staff upload media" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'media' and public.is_staff(auth.uid()));

create policy "staff update media" on storage.objects
  for update to authenticated
  using (bucket_id = 'media' and public.is_staff(auth.uid()))
  with check (bucket_id = 'media' and public.is_staff(auth.uid()));

create policy "staff delete media" on storage.objects
  for delete to authenticated
  using (bucket_id = 'media' and public.is_staff(auth.uid()));