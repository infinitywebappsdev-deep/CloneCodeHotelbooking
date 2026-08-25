grant execute on function public.has_role(uuid, public.app_role) to authenticated;
grant execute on function public.is_staff(uuid) to authenticated;

drop policy "public read rooms" on public.rooms;
create policy "public read rooms" on public.rooms for select to anon, authenticated using (published);
drop policy "public read gallery" on public.gallery_images;
create policy "public read gallery" on public.gallery_images for select to anon, authenticated using (published);
drop policy "public read faqs" on public.faqs;
create policy "public read faqs" on public.faqs for select to anon, authenticated using (published);
