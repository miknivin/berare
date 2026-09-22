-- Missed in 0021 — RLS policies alone never bypass the base table-level
-- grant Postgres requires (see 0005_grants.sql's own note on this exact
-- footgun). Every return_requests query from the storefront's session
-- client was 500ing with "permission denied for table return_requests"
-- regardless of how permissive the RLS policies were.
grant select, insert on public.return_requests to authenticated;
