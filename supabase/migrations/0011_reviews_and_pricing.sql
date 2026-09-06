-- Strikethrough pricing (compare_at_price), customer product reviews
-- (verified-purchase only, auto-published, full CRUD on their own review),
-- and admin-curated storefront-wide testimonials (fallback when a product
-- has no reviews yet).

alter table public.products
  add column compare_at_price numeric(10, 2)
    check (compare_at_price is null or compare_at_price > price);

create table public.product_reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  customer_id uuid not null references public.profiles(id) on delete cascade,
  -- Snapshot of the reviewer's display name at write time ("Priya S."
  -- style — never the full name/email). profiles RLS only allows reading
  -- your own row, so a public reader can't join profiles for other
  -- customers' names; denormalizing here avoids needing to loosen that.
  reviewer_name text not null,
  rating smallint not null check (rating between 1 and 5),
  title text,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- One review per customer per product — editing replaces it rather than
  -- stacking duplicates, matching how most ecommerce sites handle this.
  unique (product_id, customer_id)
);
create index product_reviews_product_id_idx on public.product_reviews(product_id);
create index product_reviews_customer_id_idx on public.product_reviews(customer_id);

create table public.testimonials (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  rating smallint not null check (rating between 1 and 5),
  body text not null,
  is_active boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.product_reviews enable row level security;
alter table public.testimonials enable row level security;

create policy "product_reviews: public read" on public.product_reviews
  for select using (true);

-- Verified purchase: the order containing this product must belong to the
-- reviewer and have actually completed (excludes pending/cancelled).
create policy "product_reviews: insert own verified purchase" on public.product_reviews
  for insert with check (
    auth.uid() = customer_id
    and exists (
      select 1 from public.order_items oi
      join public.orders o on o.id = oi.order_id
      where o.customer_id = auth.uid()
        and oi.product_id = product_reviews.product_id
        and o.status in ('confirmed', 'shipped', 'delivered')
    )
  );

create policy "product_reviews: update own" on public.product_reviews
  for update using (auth.uid() = customer_id)
  with check (
    auth.uid() = customer_id
    and exists (
      select 1 from public.order_items oi
      join public.orders o on o.id = oi.order_id
      where o.customer_id = auth.uid()
        and oi.product_id = product_reviews.product_id
        and o.status in ('confirmed', 'shipped', 'delivered')
    )
  );

create policy "product_reviews: delete own" on public.product_reviews
  for delete using (auth.uid() = customer_id);

create policy "testimonials: public read active" on public.testimonials
  for select using (is_active = true);
-- No client-facing insert/update/delete — admin-curated only, written via
-- the service-role client after requireStaff(), same pattern as every
-- other admin-managed table. The admin app also needs to read inactive
-- rows (to manage them), which the service-role client already bypasses
-- RLS for.

create trigger set_product_reviews_updated_at
  before update on public.product_reviews
  for each row execute function public.set_updated_at();
create trigger set_testimonials_updated_at
  before update on public.testimonials
  for each row execute function public.set_updated_at();

-- Grants: base table-level privileges required before RLS is even
-- consulted (see 0005_grants.sql). Scoped to exactly the verbs the
-- policies above support.
grant select on public.product_reviews to anon, authenticated;
grant insert, update, delete on public.product_reviews to authenticated;
grant select on public.testimonials to anon, authenticated;
