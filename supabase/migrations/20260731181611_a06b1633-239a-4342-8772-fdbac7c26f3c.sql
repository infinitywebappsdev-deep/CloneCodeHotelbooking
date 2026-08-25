revoke execute on function public.has_role(uuid, public.app_role) from anon, authenticated, public;
revoke execute on function public.is_staff(uuid) from anon, authenticated, public;
revoke execute on function public.handle_new_user() from anon, authenticated, public;
revoke execute on function public.touch_updated_at() from anon, authenticated, public;
revoke execute on function public.room_availability(date, date) from anon, authenticated, public;
grant execute on function public.has_role(uuid, public.app_role) to service_role;
grant execute on function public.is_staff(uuid) to service_role;
grant execute on function public.room_availability(date, date) to service_role;
