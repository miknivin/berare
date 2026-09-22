-- Return requests: handled on their own admin/storefront pages (like
-- affiliate applications and withdrawal requests already are), but kept in
-- sync with the parent order's status via trigger — the same pattern
-- migration 0004/0016/0019 already use to keep a denormalized status in
-- sync with a request/ledger table, rather than a new paradigm.

-- Needed to enforce the storefront's published 7-day return window
-- (apps/storefront/app/returns/page.tsx) at the DB layer — "updated_at"
-- changes on every edit, so it can't stand in for "when did this become
-- delivered".
alter table public.orders add column delivered_at timestamptz;

create function public.set_order_delivered_at()
returns trigger
language plpgsql
as $$
begin
  -- Only the first time, keyed off delivered_at itself being unset rather
  -- than the old status — a return getting rejected bounces the order
  -- back to 'delivered' (see sync_order_status_with_return_request below),
  -- and that must never reset the original delivery date/return window.
  if new.status = 'delivered' and new.delivered_at is null then
    new.delivered_at := now();
  end if;
  return new;
end;
$$;

create trigger set_order_delivered_at_trigger
  before update on public.orders
  for each row execute function public.set_order_delivered_at();

-- Extends the lifecycle with return-flow states. Rejection intentionally
-- has no distinct order status — a rejected return leaves the order's real
-- state unchanged, so it reverts to 'delivered' rather than growing a
-- 'return_rejected' order status that would need its own manual-dropdown
-- exclusion everywhere. The full history (including rejections) lives on
-- return_requests, which is what the dedicated returns page reads from.
alter table public.orders drop constraint orders_status_check;
alter table public.orders add constraint orders_status_check
  check (status in (
    'pending', 'confirmed', 'shipped', 'delivered', 'cancelled',
    'return_requested', 'return_accepted', 'returned'
  ));

create table public.return_requests (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id),
  customer_id uuid not null references public.profiles(id),
  reason text not null,
  message text,
  status text not null default 'requested' check (status in ('requested', 'accepted', 'rejected', 'completed')),
  admin_note text,
  reviewed_by uuid references public.staff(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);
create index return_requests_order_id_idx on public.return_requests(order_id);
create index return_requests_customer_id_idx on public.return_requests(customer_id);
create index return_requests_status_idx on public.return_requests(status);

-- One active (requested/accepted) return per order at a time — a customer
-- can still file a new one after a prior request is rejected or completed.
create unique index return_requests_one_active_per_order
  on public.return_requests(order_id)
  where status in ('requested', 'accepted');

alter table public.return_requests enable row level security;

create policy "return_requests: read own" on public.return_requests
  for select using (auth.uid() = customer_id);
create policy "return_requests: insert own" on public.return_requests
  for insert with check (auth.uid() = customer_id);
-- No update/delete policy for customers — status changes (accept/reject/
-- complete) only happen via the admin app's service-role client.

-- Enforces the same rules the storefront page states in its own copy:
-- only your own delivered order, only within 7 days of delivery, only one
-- active request at a time. Raising here (not just filtering the eligible-
-- orders list client-side) means this can never be bypassed by posting
-- directly to the insert policy.
create function public.validate_return_request()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_order record;
begin
  select status, delivered_at, customer_id into v_order
  from public.orders where id = new.order_id;

  if v_order is null then
    raise exception 'Order not found';
  end if;
  if v_order.customer_id <> new.customer_id then
    raise exception 'This order does not belong to you';
  end if;
  if v_order.status <> 'delivered' then
    raise exception 'Only delivered orders can be returned';
  end if;
  if v_order.delivered_at is null or v_order.delivered_at < now() - interval '7 days' then
    raise exception 'The 7-day return window for this order has passed';
  end if;

  return new;
end;
$$;

create trigger validate_return_request_trigger
  before insert on public.return_requests
  for each row execute function public.validate_return_request();

create function public.sync_order_status_with_return_request()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  update public.orders
  set status = case new.status
    when 'requested' then 'return_requested'
    when 'accepted' then 'return_accepted'
    when 'rejected' then 'delivered'
    when 'completed' then 'returned'
  end
  where id = new.order_id;
  return new;
end;
$$;

create trigger sync_order_status_with_return_request_trigger
  after insert or update on public.return_requests
  for each row execute function public.sync_order_status_with_return_request();
