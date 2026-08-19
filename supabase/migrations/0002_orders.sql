-- Orders: cart is client-side state (see plan §5); orders are the first
-- server-persisted record of a purchase.

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles(id),
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  total_amount numeric(10, 2) not null check (total_amount >= 0),
  razorpay_order_id text,
  razorpay_payment_id text,
  shipping_address jsonb,
  -- Attribution capture point: the affiliate_links.code read from the
  -- berare_ref cookie at order-creation time (plan §4).
  affiliate_ref_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index orders_customer_id_idx on public.orders(customer_id);
create index orders_status_idx on public.orders(status);
create index orders_razorpay_order_id_idx on public.orders(razorpay_order_id);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id),
  quantity integer not null check (quantity > 0),
  -- Price snapshot at purchase time — never re-read from products later,
  -- so a later price change can't rewrite historical order totals.
  unit_price numeric(10, 2) not null check (unit_price >= 0),
  created_at timestamptz not null default now()
);
create index order_items_order_id_idx on public.order_items(order_id);
create index order_items_product_id_idx on public.order_items(product_id);

alter table public.orders enable row level security;
alter table public.order_items enable row level security;

create policy "orders: read own" on public.orders
  for select using (auth.uid() = customer_id);
create policy "orders: insert own" on public.orders
  for insert with check (auth.uid() = customer_id);
-- No client-facing update/delete policy: status transitions (confirmed,
-- shipped, etc.) only happen via the Razorpay webhook handler and the
-- admin app, both server-side using the service-role client.

create policy "order_items: read own" on public.order_items
  for select using (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
      and orders.customer_id = auth.uid()
    )
  );
create policy "order_items: insert own" on public.order_items
  for insert with check (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
      and orders.customer_id = auth.uid()
    )
  );

create trigger set_orders_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();
