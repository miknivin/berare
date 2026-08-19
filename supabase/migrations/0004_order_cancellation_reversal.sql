-- Reverses affiliate points when an order tied to them is cancelled
-- (plan §6 Phase 7). Order status transitions happen only via the
-- service-role client (webhook handler, admin app), so this trigger is the
-- single place that invariant is enforced — no app-code call site can
-- forget to reverse points on cancellation.

create function public.reverse_affiliate_points_on_cancel()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_entry record;
begin
  if new.status <> 'cancelled' or old.status = 'cancelled' then
    return new;
  end if;

  for v_entry in
    select * from public.points_ledger_entries
    where reference_type = 'order' and reference_id = new.id and status <> 'reversed'
  loop
    update public.points_ledger_entries set status = 'reversed' where id = v_entry.id;

    insert into public.points_ledger_entries
      (affiliate_id, entry_type, points, status, reference_type, reference_id, description)
    values
      (v_entry.affiliate_id, 'reversed', -v_entry.points, 'confirmed', 'order', new.id,
       'Reversal: order ' || new.id || ' was cancelled');
  end loop;

  return new;
end;
$$;

create trigger reverse_affiliate_points_on_cancel_trigger
  after update on public.orders
  for each row execute function public.reverse_affiliate_points_on_cancel();
