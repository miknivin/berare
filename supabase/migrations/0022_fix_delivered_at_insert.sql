-- set_order_delivered_at only fired on UPDATE, so an order inserted
-- directly with status = 'delivered' (not the normal pending -> ... ->
-- delivered progression, but possible via a direct insert) never got
-- delivered_at set — silently breaking its return-window eligibility
-- forever, since validate_return_request() requires delivered_at to be
-- non-null. Same class of bug as 0020's order_items timing fix: caught by
-- actually exercising it, not just reading the trigger.
create trigger set_order_delivered_at_insert_trigger
  before insert on public.orders
  for each row execute function public.set_order_delivered_at();
