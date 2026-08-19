-- Affiliate system: applications, affiliates, links, click events, points
-- ledger, withdrawals — plus the tunable business constants (plan §7) and
-- the two SECURITY DEFINER functions that implement attribution (plan §4).

-- Tunable business constants -----------------------------------------------
-- One place to adjust the values the client hasn't finalized yet (plan §7)
-- without a code deploy. Seeded with placeholders explicitly called out as
-- provisional during planning.
create table public.app_config (
  key text primary key,
  value text not null,
  description text
);

insert into public.app_config (key, value, description) values
  ('min_withdrawal_amount', '2000', 'Minimum INR amount an affiliate can request as a withdrawal (§7 item 4, placeholder — client to confirm)'),
  ('attribution_window_days', '30', 'Days an affiliate ref cookie stays valid before it stops attributing orders (§7 item 3, placeholder)'),
  ('points_hold_days', '7', 'Days a points ledger entry stays "pending" before auto-confirming (§7 item 6, placeholder)'),
  ('commission_rate_percent', '5', 'Default flat commission rate applied to order total when no per-product override exists (§7 item 1, placeholder)'),
  ('points_to_inr_rate', '1', 'Conversion rate: 1 point = this many INR (§7 item 10, placeholder — currently 1:1)'),
  ('self_referral_allowed', 'false', 'Whether an affiliate can earn from their own purchases (§7 item 8, currently blocked by default)');

alter table public.app_config enable row level security;
-- No client-facing policies: only the service-role client (admin app) and
-- SECURITY DEFINER functions below ever read/write this table.

create table public.affiliate_applications (
  id uuid primary key default gen_random_uuid(),
  applicant_id uuid not null references public.profiles(id),
  full_name text not null,
  email text not null,
  phone text not null,
  message text,
  -- Absorbs whatever field list the client finalizes later with no migration.
  extra_fields jsonb not null default '{}'::jsonb,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  admin_note text,
  reviewed_by uuid references public.staff(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);
create index affiliate_applications_applicant_id_idx on public.affiliate_applications(applicant_id);
create index affiliate_applications_status_idx on public.affiliate_applications(status);

create table public.affiliates (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles(id),
  referral_code text not null unique,
  status text not null default 'active' check (status in ('active', 'suspended', 'deactivated')),
  -- Bank account number, IFSC code, account holder name — for NEFT/netbanking payout.
  payout_details jsonb,
  approved_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index affiliates_profile_id_idx on public.affiliates(profile_id);

create table public.affiliate_links (
  id uuid primary key default gen_random_uuid(),
  affiliate_id uuid not null references public.affiliates(id) on delete cascade,
  code text not null unique,
  product_id uuid references public.products(id), -- null = general/homepage link
  clicks_count integer not null default 0,
  orders_count integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create index affiliate_links_affiliate_id_idx on public.affiliate_links(affiliate_id);
create index affiliate_links_code_idx on public.affiliate_links(code);

create table public.affiliate_click_events (
  id uuid primary key default gen_random_uuid(),
  affiliate_link_id uuid not null references public.affiliate_links(id) on delete cascade,
  visitor_id text,
  ip_hash text,
  user_agent text,
  referrer text,
  landing_path text,
  created_at timestamptz not null default now()
);
create index affiliate_click_events_link_id_idx on public.affiliate_click_events(affiliate_link_id);

create table public.points_ledger_entries (
  id uuid primary key default gen_random_uuid(),
  affiliate_id uuid not null references public.affiliates(id),
  entry_type text not null check (entry_type in ('earned', 'redeemed', 'adjusted', 'reversed')),
  -- Signed: negative for redeemed/reversed entries. Available balance is
  -- simply sum(points) where status = 'confirmed'.
  points numeric(12, 2) not null,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'reversed')),
  reference_type text check (reference_type in ('order', 'withdrawal', 'manual_adjustment')),
  reference_id uuid,
  description text,
  created_at timestamptz not null default now()
);
create index points_ledger_entries_affiliate_id_idx on public.points_ledger_entries(affiliate_id);
create index points_ledger_entries_reference_idx on public.points_ledger_entries(reference_type, reference_id);

create table public.withdrawal_requests (
  id uuid primary key default gen_random_uuid(),
  affiliate_id uuid not null references public.affiliates(id),
  points_requested numeric(12, 2) not null check (points_requested > 0),
  amount_requested numeric(10, 2) not null check (amount_requested > 0),
  status text not null default 'requested' check (status in ('requested', 'approved', 'rejected', 'paid')),
  payout_reference text, -- NEFT/netbanking UTR number, filled in when marked paid
  admin_note text,
  processed_at timestamptz,
  processed_by uuid references public.staff(id),
  created_at timestamptz not null default now()
);
create index withdrawal_requests_affiliate_id_idx on public.withdrawal_requests(affiliate_id);
create index withdrawal_requests_status_idx on public.withdrawal_requests(status);

-- Row Level Security -----------------------------------------------------

alter table public.affiliate_applications enable row level security;
alter table public.affiliates enable row level security;
alter table public.affiliate_links enable row level security;
alter table public.affiliate_click_events enable row level security;
alter table public.points_ledger_entries enable row level security;
alter table public.withdrawal_requests enable row level security;

create policy "affiliate_applications: read own" on public.affiliate_applications
  for select using (auth.uid() = applicant_id);
create policy "affiliate_applications: insert own" on public.affiliate_applications
  for insert with check (auth.uid() = applicant_id);
-- No update/delete policy for applicants: status changes only via the
-- admin app's service-role client.

create policy "affiliates: read own" on public.affiliates
  for select using (auth.uid() = profile_id);
-- No insert/update/delete policy: affiliates are created and have their
-- status changed only by the admin approval flow (service-role client).

create policy "affiliate_links: read own" on public.affiliate_links
  for select using (
    affiliate_id in (select id from public.affiliates where profile_id = auth.uid())
  );
create policy "affiliate_links: insert own while active" on public.affiliate_links
  for insert with check (
    exists (
      select 1 from public.affiliates
      where id = affiliate_id and profile_id = auth.uid() and status = 'active'
    )
  );
-- clicks_count/orders_count are only ever mutated by the SECURITY DEFINER
-- functions below — no client-facing update policy.

-- affiliate_click_events has no client-facing policies at all: writes only
-- happen inside track_affiliate_click() (SECURITY DEFINER), reads only
-- through the affiliate's own aggregate counters on affiliate_links.

create policy "points_ledger_entries: read own" on public.points_ledger_entries
  for select using (
    affiliate_id in (select id from public.affiliates where profile_id = auth.uid())
  );
-- No client-facing insert/update: entries are created by
-- record_affiliate_attribution(), the withdrawal-request trigger below, or
-- the admin app.

create policy "withdrawal_requests: read own" on public.withdrawal_requests
  for select using (
    affiliate_id in (select id from public.affiliates where profile_id = auth.uid())
  );
create policy "withdrawal_requests: insert own while active" on public.withdrawal_requests
  for insert with check (
    exists (
      select 1 from public.affiliates
      where id = affiliate_id and profile_id = auth.uid() and status = 'active'
    )
  );
-- No client-facing update: approve/reject/mark-paid only via admin app.

-- Available balance ---------------------------------------------------------
create function public.affiliate_available_points(p_affiliate_id uuid)
returns numeric
language sql
stable
as $$
  select coalesce(sum(points), 0)
  from public.points_ledger_entries
  where affiliate_id = p_affiliate_id
  and status = 'confirmed';
$$;

-- Withdrawal validation + points reservation --------------------------------
-- Enforces "a withdrawal must never exceed available balance" and the
-- configured minimum at the database layer, not just in application code.
create function public.validate_withdrawal_request()
returns trigger
language plpgsql
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

create trigger validate_withdrawal_request_trigger
  before insert on public.withdrawal_requests
  for each row execute function public.validate_withdrawal_request();

-- Reserve the requested points immediately (moves them out of "available"
-- until the withdrawal is rejected, which reverses this entry, or paid).
create function public.reserve_withdrawal_points()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.points_ledger_entries
    (affiliate_id, entry_type, points, status, reference_type, reference_id, description)
  values
    (new.affiliate_id, 'redeemed', -new.points_requested, 'confirmed', 'withdrawal', new.id, 'Reserved for withdrawal request');
  return new;
end;
$$;

create trigger reserve_withdrawal_points_trigger
  after insert on public.withdrawal_requests
  for each row execute function public.reserve_withdrawal_points();

-- Click tracking (plan §4 step 3) --------------------------------------------
-- Callable by anonymous visitors. SECURITY DEFINER because anon has no
-- direct write access to affiliate_click_events or affiliate_links.
create function public.track_affiliate_click(
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
  v_link_id uuid;
begin
  select id into v_link_id
  from public.affiliate_links
  where code = p_code and is_active = true;

  if v_link_id is null then
    return; -- unknown or inactive code: silently no-op, never error the page load
  end if;

  insert into public.affiliate_click_events
    (affiliate_link_id, visitor_id, ip_hash, user_agent, referrer, landing_path)
  values
    (v_link_id, p_visitor_id, p_ip_hash, p_user_agent, p_referrer, p_landing_path);

  update public.affiliate_links set clicks_count = clicks_count + 1 where id = v_link_id;
end;
$$;

grant execute on function public.track_affiliate_click to anon, authenticated;

-- Order attribution (plan §4 step 5, revised) --------------------------------
-- Called from the Razorpay webhook handler once a payment is actually
-- confirmed (POST /api/webhooks/razorpay), using the service-role client —
-- not from order creation. Rewarding an affiliate for a cart that was
-- never paid for makes no sense, so attribution happens on payment
-- confirmation, not on order insert.
--
-- SECURITY DEFINER because the webhook has no customer session to act as
-- (Razorpay calls our server directly). The ownership guard below only
-- applies when there IS an authenticated caller — auth.uid() is null for
-- the service-role client, so a trusted server-side call skips it, while
-- an authenticated end-user (if this is ever called client-side too) still
-- can't attribute an order they don't own.
create function public.record_affiliate_attribution(p_order_id uuid)
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
    (v_affiliate.id, 'earned', v_points, 'pending', 'order', p_order_id, 'Commission for order ' || p_order_id);
end;
$$;

grant execute on function public.record_affiliate_attribution to authenticated;
