-- Wires up the previously-unbuilt withdrawal flow (docs/open-business-
-- decisions.md rows 5 & 6): lets affiliates save their own bank details and
-- actually get their earned points confirmed so a withdrawal is possible.

-- Affiliates can update their own payout_details (bank account holder name,
-- account number, IFSC code) — nothing else on the row. Column-level grant
-- means an attempt to change referral_code/status/etc. via the same
-- policy is rejected at the privilege level, not just by convention.
grant update (payout_details) on public.affiliates to authenticated;

create policy "affiliates: update own payout details" on public.affiliates
  for update
  using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id);

-- Commission points are now confirmed the moment an order is attributed,
-- rather than sitting in 'pending' forever (no scheduled job ever existed
-- to honor app_config.points_hold_days — see open-business-decisions.md
-- row 6). Cancellation reversal (migration 0004) already handles the case
-- where a confirmed order is later cancelled.
create or replace function public.record_affiliate_attribution(p_order_id uuid)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_order record;
  v_link record;
  v_affiliate record;
  v_self_referral_allowed boolean;
  v_commission_rate numeric;
  v_points numeric;
begin
  select id, customer_id, affiliate_ref_code, total_amount into v_order
  from public.orders where id = p_order_id;

  if v_order is null then
    return;
  end if;

  if auth.uid() is not null and v_order.customer_id <> auth.uid() then
    return; -- an authenticated caller may only attribute their own order
  end if;

  if v_order.affiliate_ref_code is null then
    return;
  end if;

  select * into v_link from public.affiliate_links
  where code = v_order.affiliate_ref_code and is_active = true;
  if v_link is null then
    return;
  end if;

  select * into v_affiliate from public.affiliates
  where id = v_link.affiliate_id and status = 'active';
  if v_affiliate is null then
    return;
  end if;

  select (value = 'true') into v_self_referral_allowed
  from public.app_config where key = 'self_referral_allowed';
  if not v_self_referral_allowed and v_affiliate.profile_id = v_order.customer_id then
    return; -- self-referral blocked by default (§7 item 8)
  end if;

  -- Idempotency: never double-credit the same order.
  if exists (
    select 1 from public.points_ledger_entries
    where reference_type = 'order' and reference_id = p_order_id
  ) then
    return;
  end if;

  update public.affiliate_links set orders_count = orders_count + 1 where id = v_link.id;

  select value::numeric into v_commission_rate
  from public.app_config where key = 'commission_rate_percent';
  v_points := round(v_order.total_amount * v_commission_rate / 100, 2);

  insert into public.points_ledger_entries
    (affiliate_id, entry_type, points, status, reference_type, reference_id, description)
  values
    (v_affiliate.id, 'earned', v_points, 'confirmed', 'order', p_order_id, 'Commission for order ' || p_order_id);
end;
$$;

-- Rejecting a withdrawal request must give the reserved points back — the
-- insert trigger (reserve_withdrawal_points, migration 0003) already
-- deducted them from the available balance the moment the request was
-- filed, so without this an affiliate would permanently lose points for a
-- withdrawal that never happened.
create function public.reverse_withdrawal_points_on_reject()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.status <> 'rejected' or old.status = 'rejected' then
    return new;
  end if;

  update public.points_ledger_entries
  set status = 'reversed'
  where reference_type = 'withdrawal' and reference_id = new.id and status = 'confirmed';

  insert into public.points_ledger_entries
    (affiliate_id, entry_type, points, status, reference_type, reference_id, description)
  values
    (new.affiliate_id, 'adjusted', new.points_requested, 'confirmed', 'withdrawal', new.id,
     'Reversal: withdrawal request rejected');

  return new;
end;
$$;

create trigger reverse_withdrawal_points_on_reject_trigger
  after update on public.withdrawal_requests
  for each row execute function public.reverse_withdrawal_points_on_reject();
