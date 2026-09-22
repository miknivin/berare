-- Fixes a real bug found via live testing: for COD orders, /api/orders
-- inserts the `orders` row (status already 'confirmed') BEFORE inserting
-- `order_items` in a separate statement. The 0019 trigger fired on the
-- orders INSERT and tried to read order_items that didn't exist yet, so it
-- silently logged nothing for every COD order.
--
-- Razorpay orders aren't affected — order_items are inserted right after
-- order creation, long before the webhook later updates status to
-- 'confirmed', so by the time that UPDATE fires, order_items already exist.
--
-- Fix: split into two triggers so each fires only when both the order's
-- confirmed status AND its order_items are actually present:
--   - orders AFTER UPDATE (unchanged from 0019) handles Razorpay's
--     pending -> confirmed transition, where order_items pre-date it.
--   - order_items AFTER INSERT (new) handles COD, where the order is
--     already 'confirmed' by the time each item row lands.
-- Neither can double-fire for the same order: COD's status is never
-- UPDATEd after insert, so the orders-UPDATE trigger never sees it.

create or replace function public.log_stock_movement_on_order_confirmed()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.status <> 'confirmed' or old.status = 'confirmed' then
    return new;
  end if;

  insert into public.stock_movements (product_id, order_id, quantity_delta, reason)
  select oi.product_id, new.id, -oi.quantity, 'order_confirmed'
  from public.order_items oi
  where oi.order_id = new.id;

  return new;
end;
$$;

-- Recreate as UPDATE-only — the INSERT case is now order_items' job.
drop trigger if exists log_stock_movement_on_order_confirmed_trigger on public.orders;
create trigger log_stock_movement_on_order_confirmed_trigger
  after update on public.orders
  for each row execute function public.log_stock_movement_on_order_confirmed();

create function public.log_stock_movement_on_order_item_insert()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_order_status text;
begin
  select status into v_order_status from public.orders where id = new.order_id;

  if v_order_status = 'confirmed' then
    insert into public.stock_movements (product_id, order_id, quantity_delta, reason)
    values (new.product_id, new.order_id, -new.quantity, 'order_confirmed');
  end if;

  return new;
end;
$$;

create trigger log_stock_movement_on_order_item_insert_trigger
  after insert on public.order_items
  for each row execute function public.log_stock_movement_on_order_item_insert();
