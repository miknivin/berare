-- Public lead-capture form (e.g. "enquire about this offer" on a homepage
-- promo banner) — anyone can submit, nobody but staff can read. No
-- customer_id/auth.uid() link since the visitor isn't necessarily signed
-- in at all.
create table public.enquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  email text,
  message text,
  -- Free-text identifier for where the enquiry came from (e.g. the
  -- specific banner/slide clicked) — not a foreign key, since the source
  -- is a UI location, not a database entity.
  source text,
  created_at timestamptz not null default now(),
  constraint enquiries_contact_required check (phone is not null or email is not null)
);

create index enquiries_created_at_idx on public.enquiries (created_at desc);

alter table public.enquiries enable row level security;

-- Anyone (including anonymous visitors) can submit an enquiry, but only
-- staff — via the admin app's service-role client — can ever read them
-- back. No select/update/delete policy exists here on purpose: RLS with
-- no matching policy denies by default.
create policy "enquiries: public insert" on public.enquiries
  for insert
  with check (true);

grant insert on public.enquiries to anon, authenticated;
