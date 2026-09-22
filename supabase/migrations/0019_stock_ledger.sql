-- Replaces migration 0018's direct-UPDATE stock triggers with an
-- append-only ledger (same pattern as points_ledger_entries): order
-- confirmation/cancellation only ever INSERTs a movement row — cheap and
-- contention-free even under concurrent orders for the same product —
-- instead of taking a row lock on products.stock_quantity inside the
-- customer-facing request. The actual products.stock_quantity cache is
-- then brought back in sync out-of-band (fire-and-forget after the
-- response, and by the daily reconciliation cron), never inside the
-- checkout request itself.

create table public.stock_movements (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  order_id uuid references public.orders(id),
  -- Negative = stock leaving (order confirmed), positive = stock coming
  -- back (order cancelled, or a manual increase from the admin product form).
  quantity_delta integer not null,
  reason text not null check (reason in ('order_confirmed', 'order_cancelled', 'manual_adjustment')),
  created_at timestamptz not null default now()
);
create index stock_movements_product_id_idx on public.stock_movements(product_id);
create index stock_movements_order_id_idx on public.stock_movements(order_id);

alter table public.stock_movements enable row level security;
-- No client-facing policies — read via the admin app's service-role
-- client, written only by the triggers/functions below and the admin
-- product actions (also service-role).

-- Baseline the ledger against whatever stock_quantity already holds, so
-- reconciliation has an accurate starting point instead of assuming every
-- product started at 0.
insert into public.stock_movements (product_id, quantity_delta, reason)
select id, stock_quantity, 'manual_adjustment' from public.products where stock_quantity <> 0;

-- Drop 0018's direct-mutation triggers/functions — logging replaces them.
drop trigger if exists decrement_stock_on_order_confirmed_trigger on public.orders;
drop trigger if exists restore_stock_on_order_cancelled_trigger on public.orders;
drop function if exists public.decrement_stock_on_order_confirmed();
drop function if exists public.restore_stock_on_order_cancelled();

create function public.log_stock_movement_on_order_confirmed()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    if new.status <> 'confirmed' then
      return new;
    end if;
  else
    if new.status <> 'confirmed' or old.status = 'confirmed' then
      return new;
    end if;
  end if;

  insert into public.stock_movements (product_id, order_id, quantity_delta, reason)
  select oi.product_id, new.id, -oi.quantity, 'order_confirmed'
  from public.order_items oi
  where oi.order_id = new.id;

  return new;
end;
$$;

create trigger log_stock_movement_on_order_confirmed_trigger
  after insert or update on public.orders
  for each row execute function public.log_stock_movement_on_order_confirmed();

create function public.log_stock_movement_on_order_cancelled()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.status <> 'cancelled' or old.status = 'cancelled' or old.status <> 'confirmed' then
    return new;
  end if;

  insert into public.stock_movements (product_id, order_id, quantity_delta, reason)
  select oi.product_id, new.id, oi.quantity, 'order_cancelled'
  from public.order_items oi
  where oi.order_id = new.id;

  return new;
end;
$$;

create trigger log_stock_movement_on_order_cancelled_trigger
  after update on public.orders
  for each row execute function public.log_stock_movement_on_order_cancelled();

-- Reconciliation ------------------------------------------------------------
-- Recomputes stock_quantity from the ledger for one product (p_product_id
-- given) or every product (null) — the single place that ever writes
-- products.stock_quantity now. Called fire-and-forget right after an order
-- is confirmed/cancelled, and by the daily cron as a catch-all.
create function public.reconcile_product_stock(p_product_id uuid default null)
returns table(product_id uuid, old_quantity integer, new_quantity integer)
language plpgsql
security definer set search_path = public
as $$
begin
  return query
  with computed as (
    select p.id, p.stock_quantity as old_qty,
           greatest(0, coalesce(sum(sm.quantity_delta), 0))::integer as new_qty
    from public.products p
    left join public.stock_movements sm on sm.product_id = p.id
    where p_product_id is null or p.id = p_product_id
    group by p.id, p.stock_quantity
  ),
  updated as (
    update public.products p
    set stock_quantity = computed.new_qty
    from computed
    where p.id = computed.id and p.stock_quantity <> computed.new_qty
    returning p.id, computed.old_qty, computed.new_qty
  )
  select id, old_qty, new_qty from updated;
end;
$$;

grant execute on function public.reconcile_product_stock(uuid) to authenticated;

-- Reconciles every product touched by one order in a single call, so the
-- fire-and-forget step after checkout doesn't need to know product ids.
create function public.reconcile_stock_for_order(p_order_id uuid)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_product_id uuid;
begin
  for v_product_id in select distinct product_id from public.order_items where order_id = p_order_id loop
    perform public.reconcile_product_stock(v_product_id);
  end loop;
end;
$$;

grant execute on function public.reconcile_stock_for_order(uuid) to authenticated;
