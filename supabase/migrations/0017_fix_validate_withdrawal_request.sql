-- validate_withdrawal_request() (migration 0003) reads public.app_config,
-- which has no client-facing select policy on purpose (service-role/
-- SECURITY DEFINER only). The trigger was never marked SECURITY DEFINER,
-- so it ran as the invoking `authenticated` role and every real withdrawal
-- insert failed with "permission denied for table app_config" — this went
-- unnoticed until the affiliate withdrawal UI actually exercised it.
create or replace function public.validate_withdrawal_request()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_available numeric;
  v_min numeric;
begin
  select public.affiliate_available_points(new.affiliate_id) into v_available;
  select value::numeric into v_min from public.app_config where key = 'min_withdrawal_amount';

  if new.amount_requested < v_min then
    raise exception 'Withdrawal amount % is below the minimum of %', new.amount_requested, v_min;
  end if;

  if new.points_requested > v_available then
    raise exception 'Withdrawal of % points exceeds available balance of %', new.points_requested, v_available;
  end if;

  return new;
end;
$$;
