-- RLS policies control which ROWS a role can see/touch, but Postgres still
-- requires a base table-level GRANT before RLS is even consulted — without
-- it, every query 500s with "permission denied for table X" regardless of
-- how permissive the RLS policy is. These grants are deliberately scoped
-- to exactly the verbs each table's RLS policies (0001-0003) already
-- support; RLS still does the real row-level restriction on top of these.

-- Public catalog browsing — no auth required.
grant select on public.categories to anon, authenticated;
grant select on public.products to anon, authenticated;
grant select on public.product_images to anon, authenticated;

-- Customer self-service (RLS scopes every row to auth.uid()).
grant select, insert, update on public.profiles to authenticated;
grant select, insert on public.orders to authenticated;
grant select, insert on public.order_items to authenticated;
grant select, insert on public.affiliate_applications to authenticated;
grant select on public.affiliates to authenticated;
grant select, insert on public.affiliate_links to authenticated;
grant select on public.points_ledger_entries to authenticated;
grant select, insert on public.withdrawal_requests to authenticated;

-- staff: only the "read own" self-check policy exists (plan §3) — the
-- admin app's actual privileged queries go through the service-role
-- client, which bypasses grants and RLS entirely.
grant select on public.staff to authenticated;

-- affiliate_click_events and app_config have no client-facing RLS
-- policies at all (writes only happen inside SECURITY DEFINER functions,
-- which run as the function owner regardless of grants) — no grant needed.
