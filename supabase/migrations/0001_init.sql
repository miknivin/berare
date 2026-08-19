-- Identity and catalog: profiles, staff, categories, products, product_images

create extension if not exists "pgcrypto";

-- One row per Supabase Auth identity that has completed profile setup.
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  account_status text not null default 'active' check (account_status in ('active', 'disabled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Presence of a row here grants access to the admin app. No separate
-- staff-auth system: staff sign in via the same Supabase Auth project.
create table public.staff (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'admin' check (role in ('admin', 'support')),
  created_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  parent_id uuid references public.categories(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  price numeric(10, 2) not null check (price >= 0),
  currency text not null default 'INR',
  status text not null default 'draft' check (status in ('draft', 'active', 'disabled')),
  category_id uuid references public.categories(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index products_category_id_idx on public.products(category_id);
create index products_status_idx on public.products(status);

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  storage_path text not null,
  position integer not null default 0,
  created_at timestamptz not null default now()
);
create index product_images_product_id_idx on public.product_images(product_id);

-- Row Level Security -----------------------------------------------------
-- Every table is enabled with no default-open policy: RLS on + zero
-- policies denies all access, which is the safe failure mode if a policy
-- is ever missing. The admin app never uses these policies (it goes
-- through the service-role client after a staff check), so they only need
-- to cover storefront/affiliate self-service + public catalog browsing.

alter table public.profiles enable row level security;
alter table public.staff enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;

create policy "profiles: read own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles: update own" on public.profiles
  for update using (auth.uid() = id);
create policy "profiles: insert own" on public.profiles
  for insert with check (auth.uid() = id);

-- Self-read only: lets the admin app's Route Handlers check "is the
-- signed-in user staff?" using the ordinary server client (RLS-scoped),
-- before switching to the service-role client for the actual privileged
-- query. A user reading whether their own id has a staff row leaks
-- nothing; there's no broader policy allowing staff to list each other.
create policy "staff: read own" on public.staff
  for select using (auth.uid() = id);

create policy "categories: public read" on public.categories
  for select using (true);

create policy "products: public read active" on public.products
  for select using (status = 'active');

create policy "product_images: public read for active products" on public.product_images
  for select using (
    exists (
      select 1 from public.products
      where products.id = product_images.product_id
      and products.status = 'active'
    )
  );

-- Keep profiles.updated_at current on every update.
create function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger set_categories_updated_at
  before update on public.categories
  for each row execute function public.set_updated_at();
create trigger set_products_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- Auto-create a profile row when a new auth identity is created (Google
-- or Email OTP sign-in both land here).
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
