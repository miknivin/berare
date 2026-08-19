-- auth.users isn't reachable through PostgREST (the API layer our
-- Supabase clients talk to only sees the public schema), so the admin
-- app has no way to show "customer email" on an order without denormalizing
-- it onto profiles. Kept in sync going forward via handle_new_user; this
-- also backfills the two seeded accounts.

alter table public.profiles add column email text;

update public.profiles p
set email = u.email
from auth.users u
where u.id = p.id;

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$ language plpgsql security definer set search_path = public;
