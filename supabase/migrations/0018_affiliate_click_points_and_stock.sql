-- Affiliate settings modal (admin): adds a per-click reward on top of the
-- existing per-order commission (commission_rate_percent) and points-to-INR
-- rate, all editable from one place instead of only via SQL.

insert into public.app_config (key, value, description) values
  ('points_per_click', '0', 'Points awarded to the affiliate immediately when their link is clicked (0 = disabled)');

alter table public.points_ledger_entries drop constraint points_ledger_entries_reference_type_check;
alter table public.points_ledger_entries add constraint points_ledger_entries_reference_type_check
  check (reference_type in ('order', 'withdrawal', 'manual_adjustment', 'click'));

create or replace function public.track_affiliate_click(
  p_code text,
  p_visitor_id text default null,
  p_ip_hash text default null,
  p_user_agent text default null,
  p_referrer text default null,
  p_landing_path text default null
)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_link record;
  v_affiliate record;
  v_click_id uuid;
  v_points_per_click numeric;
begin
  select * into v_link
  from public.affiliate_links
  where code = p_code and is_active = true;

  if v_link is null then
    return; -- unknown or inactive code: silently no-op, never error the page load
  end if;

  insert into public.affiliate_click_events
    (affiliate_link_id, visitor_id, ip_hash, user_agent, referrer, landing_path)
  values
    (v_link.id, p_visitor_id, p_ip_hash, p_user_agent, p_referrer, p_landing_path)
  returning id into v_click_id;

  update public.affiliate_links set clicks_count = clicks_count + 1 where id = v_link.id;

  -- Click rewards only for active affiliates, same as order commissions.
  select * into v_affiliate from public.affiliates
  where id = v_link.affiliate_id and status = 'active';
  if v_affiliate is null then
    return;
  end if;

  select value::numeric into v_points_per_click
  from public.app_config where key = 'points_per_click';

  if v_points_per_click > 0 then
    insert into public.points_ledger_entries
      (affiliate_id, entry_type, points, status, reference_type, reference_id, description)
    values
      (v_affiliate.id, 'earned', v_points_per_click, 'confirmed', 'click', v_click_id, 'Click reward');
  end if;
end;
$$;

-- Product stock ---------------------------------------------------------
-- No stock tracking existed at all before this — products.status only
-- controlled storefront visibility, not availability. Orders are only
-- ever placed for one quantity-checked snapshot at a time (see the
-- decrement trigger below), so a simple integer counter is enough; no
-- separate reservations/holds table.
alter table public.products add column stock_quantity integer not null default 0 check (stock_quantity >= 0);

-- Decrement stock the moment an order is confirmed (COD: immediately on
-- insert; Razorpay: when the webhook flips status to 'confirmed'), mirroring
-- how affiliate attribution is already gated on confirmation, not creation.
create function public.decrement_stock_on_order_confirmed()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  -- OLD isn't bound during an INSERT-fired invocation, so its branch never
  -- touches old.* — the two cases (COD confirms on insert; Razorpay
  -- confirms via a later update) are kept fully separate rather than
  -- combined into one boolean expression.
  if tg_op = 'INSERT' then
    if new.status <> 'confirmed' then
      return new;
    end if;
  else
    if new.status <> 'confirmed' or old.status = 'confirmed' then
      return new;
    end if;
  end if;

  update public.products p
  set stock_quantity = greatest(0, p.stock_quantity - oi.quantity)
  from public.order_items oi
  where oi.order_id = new.id and oi.product_id = p.id;

  return new;
end;
$$;

create trigger decrement_stock_on_order_confirmed_trigger
  after insert or update on public.orders
  for each row execute function public.decrement_stock_on_order_confirmed();

-- Restore stock if a confirmed order is later cancelled — mirrors the
-- affiliate points reversal trigger's cancellation handling (migration 0004).
create function public.restore_stock_on_order_cancelled()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.status <> 'cancelled' or old.status = 'cancelled' or old.status <> 'confirmed' then
    return new;
  end if;

  update public.products p
  set stock_quantity = p.stock_quantity + oi.quantity
  from public.order_items oi
  where oi.order_id = new.id and oi.product_id = p.id;

  return new;
end;
$$;

create trigger restore_stock_on_order_cancelled_trigger
  after update on public.orders
  for each row execute function public.restore_stock_on_order_cancelled();
